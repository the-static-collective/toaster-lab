/**
 * Toaster Lab - Server-Side Gemini API Proposer Service
 * Uses @google/genai SDK to analyze audio, lyrics, imagery, seeds, constraints, and historical coverage.
 */

import { GoogleGenAI, Type } from "@google/genai";
import {
  AnalysisMode,
  Evidence,
  GarmentConstraint,
  GenerationPlan,
  LockState,
  PlanProposal,
  RationaleItem,
} from "../types/toaster";
import {
  DEFAULT_GARMENT_CONSTRAINT,
  validatePlanAndEnforceConstraints,
  applyLocks,
  TOPOLOGIES,
  MATERIALS,
  MOTION_GRAMMARS,
  CAMERA_GRAMMARS,
  LYRIC_BEHAVIORS,
  TEMPORAL_DENSITIES,
} from "../lib/toasterEngine";

// Shared Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Falling back to deterministic proposal generation.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export interface ProposeRequestPayload {
  mode: AnalysisMode;
  counterfactualRemovedModality?: "audio" | "lyrics" | "image";
  audioInfo?: { filename: string; durationSeconds: number; bpmEstimate?: number };
  lyrics?: string;
  imageInfo?: { filename: string; mimeType: string; base64?: string };
  seed: number;
  garmentConstraint?: GarmentConstraint;
  lockedPlan?: GenerationPlan | null;
  lockState?: LockState;
  noveltyTarget?: { topology?: string; material?: string; motionGrammar?: string; rationale?: string };
}

/**
 * Generate 3 GenerationPlan proposals using Gemini or fallback
 */
export async function generateProposals(payload: ProposeRequestPayload): Promise<PlanProposal[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const constraints = payload.garmentConstraint || DEFAULT_GARMENT_CONSTRAINT;

  if (!apiKey) {
    return generateFallbackProposals(payload, constraints);
  }

  try {
    const ai = getGeminiClient();

    // Context preparation based on mode
    let audioText = "";
    if (payload.mode !== "seed_only" && payload.mode !== "lyrics_only" && payload.mode !== "image_only") {
      if (payload.mode === "counterfactual" && payload.counterfactualRemovedModality === "audio") {
        audioText = "AUDIO MODALITY EXCLUDED (COUNTERFACTUAL EXPERIMENT)";
      } else if (payload.audioInfo) {
        audioText = `Audio track: ${payload.audioInfo.filename}, Duration: ${payload.audioInfo.durationSeconds}s, Estimated BPM: ${payload.audioInfo.bpmEstimate || 128}.`;
      }
    }

    let lyricsText = "";
    if (payload.mode !== "seed_only" && payload.mode !== "audio_only" && payload.mode !== "image_only") {
      if (payload.mode === "counterfactual" && payload.counterfactualRemovedModality === "lyrics") {
        lyricsText = "LYRICS MODALITY EXCLUDED (COUNTERFACTUAL EXPERIMENT)";
      } else if (payload.lyrics) {
        lyricsText = `Song Lyrics:\n${payload.lyrics}`;
      }
    }

    let imageText = "";
    if (payload.mode !== "seed_only" && payload.mode !== "audio_only" && payload.mode !== "lyrics_only") {
      if (payload.mode === "counterfactual" && payload.counterfactualRemovedModality === "image") {
        imageText = "IMAGE MODALITY EXCLUDED (COUNTERFACTUAL EXPERIMENT)";
      } else if (payload.imageInfo) {
        imageText = `Cover Image filename: ${payload.imageInfo.filename}`;
      }
    }

    let noveltyText = "";
    if (payload.noveltyTarget) {
      noveltyText = `CREATIVE COVERAGE MANDATE ("Take me somewhere the Toaster has not gone yet"): Biased toward unvisited frontier combination -> Topology: ${payload.noveltyTarget.topology}, Material: ${payload.noveltyTarget.material}, Motion: ${payload.noveltyTarget.motionGrammar}. Rationale: ${payload.noveltyTarget.rationale}.`;
    }

    const lockedText = payload.lockState && payload.lockedPlan
      ? `LOCKED FIELDS MANDATE: The user locked these parameters from a prior plan: ${JSON.stringify(payload.lockState)}. You MUST strictly keep locked fields identical.`
      : "";

    const systemPrompt = `You are Toaster Lab's multimodal AI creative planner for the Haunted Toaster deterministic music-video renderer.
Your task is to analyze inputs and propose EXACTLY 3 valid GenerationPlan proposals:
1. Faithful — follows strongest observable evidence in audio, lyrics, image, or constraints.
2. Mutation — explores an unusual but schema-valid combination.
3. Foreign Body — introduces EXACTLY ONE visually coherent element not directly explained by the source material.

Valid Schema Choices:
- topology: ${TOPOLOGIES.join(", ")}
- material: ${MATERIALS.join(", ")}
- motionGrammar: ${MOTION_GRAMMARS.join(", ")}
- cameraGrammar: ${CAMERA_GRAMMARS.join(", ")}
- lyricBehavior: ${LYRIC_BEHAVIORS.join(", ")}
- temporalDensity: ${TEMPORAL_DENSITIES.join(", ")}
- garmentParams: maxStiffness (0.0 to 1.0, max limit ${constraints.maxStiffnessLimit}), fitMode (${constraints.allowedFitModes.join(", ")}), fabricMemory (0.0 to 1.0), seamStressLimit (max ${constraints.seamStressCap}).
- paletteLogic: primary, secondary, accent, background (hex strings, NOT forbidden colors: ${constraints.forbiddenColors.join(", ")}), mood, shiftTrigger ("transient" | "lyric_beat" | "sectional" | "stasis").

CRITICAL: For EVERY plan parameter, provide evidence rationale with source ('audio', 'lyrics', 'image', 'seed', or 'constraint'), interval [startSec, endSec] if applicable, excerpt, and observation string.

Never generate executable rendering code, FFmpeg filters, or arbitrary CSS parameters outside the schema.`;

    const userPrompt = `Analysis Mode: ${payload.mode}
Seed: ${payload.seed}
Garment Constraint Spec: ${constraints.name}
${audioText}
${lyricsText}
${imageText}
${noveltyText}
${lockedText}

Produce JSON output containing the 3 proposal plans with detailed rationale and mutations list.`;

    // Multimodal parts
    const contentsParts: any[] = [];
    if (payload.imageInfo?.base64 && (payload.mode === "full" || payload.mode === "image_only")) {
      contentsParts.push({
        inlineData: {
          mimeType: payload.imageInfo.mimeType || "image/png",
          data: payload.imageInfo.base64.replace(/^data:image\/\w+;base64,/, ""),
        },
      });
    }
    contentsParts.push({ text: userPrompt });

    const proposalSchema = {
      type: Type.OBJECT,
      properties: {
        proposals: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              proposalType: { type: Type.STRING },
              title: { type: Type.STRING },
              tagline: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              foreignElement: { type: Type.STRING },
              plan: {
                type: Type.OBJECT,
                properties: {
                  topology: { type: Type.STRING },
                  material: { type: Type.STRING },
                  motionGrammar: { type: Type.STRING },
                  cameraGrammar: { type: Type.STRING },
                  lyricBehavior: { type: Type.STRING },
                  temporalDensity: { type: Type.STRING },
                  paletteLogic: {
                    type: Type.OBJECT,
                    properties: {
                      primary: { type: Type.STRING },
                      secondary: { type: Type.STRING },
                      accent: { type: Type.STRING },
                      background: { type: Type.STRING },
                      mood: { type: Type.STRING },
                      shiftTrigger: { type: Type.STRING },
                    },
                  },
                  garmentParams: {
                    type: Type.OBJECT,
                    properties: {
                      maxStiffness: { type: Type.NUMBER },
                      fitMode: { type: Type.STRING },
                      fabricMemory: { type: Type.NUMBER },
                      seamStressLimit: { type: Type.NUMBER },
                    },
                  },
                  meta: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      artist: { type: Type.STRING },
                      seed: { type: Type.NUMBER },
                      schemaVersion: { type: Type.STRING },
                      durationSeconds: { type: Type.NUMBER },
                      bpm: { type: Type.NUMBER },
                    },
                  },
                },
              },
              rationale: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    field: { type: Type.STRING },
                    evidence: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          source: { type: Type.STRING },
                          interval: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER },
                          },
                          excerpt: { type: Type.STRING },
                          observation: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
              },
              mutations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    field: { type: Type.STRING },
                    previous: { type: Type.STRING },
                    proposed: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: contentsParts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: proposalSchema,
        seed: payload.seed,
        temperature: 0.7,
      },
    });

    const rawText = response.text || "";
    let parsed: any = null;
    try {
      let cleaned = rawText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const candidate = cleaned.substring(firstBrace, lastBrace + 1);
          parsed = JSON.parse(candidate);
        } else {
          throw e;
        }
      }
    } catch (parseErr) {
      console.warn("Failed to parse Gemini response JSON, returning fallbacks:", parseErr);
      return generateFallbackProposals(payload, constraints);
    }

    if (parsed && parsed.proposals && Array.isArray(parsed.proposals) && parsed.proposals.length === 3) {
      return parsed.proposals.map((prop: any, idx: number) => {
        const { validPlan } = validatePlanAndEnforceConstraints(prop.plan, constraints);
        const lockedPlan = payload.lockState && payload.lockedPlan
          ? applyLocks(validPlan, payload.lockedPlan, payload.lockState)
          : validPlan;

        return {
          id: prop.id || `prop_${idx + 1}_${payload.seed}`,
          proposalType: prop.proposalType || (idx === 0 ? "faithful" : idx === 1 ? "mutation" : "foreign_body"),
          title: prop.title || (idx === 0 ? "Faithful Spec" : idx === 1 ? "Mutated Vector" : "Foreign Monolith"),
          tagline: prop.tagline || "Generative recipe candidate for Haunted Toaster",
          plan: lockedPlan,
          rationale: prop.rationale || [],
          mutations: prop.mutations || [],
          confidence: typeof prop.confidence === "number" ? prop.confidence : 0.88,
          foreignElement: prop.foreignElement,
        };
      });
    }

    return generateFallbackProposals(payload, constraints);
  } catch (err) {
    console.error("Gemini proposal generation error:", err);
    return generateFallbackProposals(payload, constraints);
  }
}

/**
 * Deterministic fallback proposal generator
 */
export function generateFallbackProposals(
  payload: ProposeRequestPayload,
  constraints: GarmentConstraint
): PlanProposal[] {
  const seed = payload.seed;

  // 1. Faithful
  const faithfulPlan: GenerationPlan = {
    meta: {
      title: payload.audioInfo?.filename ? `Faithful Plan: ${payload.audioInfo.filename}` : "Faithful Plan",
      artist: "Toaster Lab Synthesizer",
      seed,
      schemaVersion: "1.0.0",
      durationSeconds: payload.audioInfo?.durationSeconds || 180,
      bpm: payload.audioInfo?.bpmEstimate || 128,
    },
    topology: "platonic_solids",
    material: "anodized_titanium",
    paletteLogic: {
      primary: "#0F172A",
      secondary: "#38BDF8",
      accent: "#F43F5E",
      background: "#020617",
      mood: "cyber_twilight",
      shiftTrigger: "transient",
    },
    motionGrammar: "staccato_pulses",
    cameraGrammar: "orbital_macro",
    lyricBehavior: "kinetic_type",
    temporalDensity: "high",
    garmentParams: {
      maxStiffness: Math.min(0.7, constraints.maxStiffnessLimit),
      fitMode: "draped",
      fabricMemory: 0.65,
      seamStressLimit: Math.min(100, constraints.seamStressCap),
    },
    sceneBlocks: [
      {
        startTime: 0,
        endTime: (payload.audioInfo?.durationSeconds || 180) / 2,
        label: "Sub-Transient Build",
        primaryFocus: "Anodized geometry pulsing to bass transients",
        parameterModulations: { pulseIntensity: 0.8 },
      },
    ],
  };

  // 2. Mutation
  const mutationPlan: GenerationPlan = {
    ...faithfulPlan,
    meta: { ...faithfulPlan.meta, title: "Mutation Vector" },
    topology: payload.noveltyTarget?.topology as any || "organic_ribs",
    material: payload.noveltyTarget?.material as any || "bioluminescent_silk",
    motionGrammar: payload.noveltyTarget?.motionGrammar as any || "fluid_wave",
    cameraGrammar: "spiral_zoom",
    temporalDensity: "medium",
    garmentParams: {
      maxStiffness: Math.min(0.45, constraints.maxStiffnessLimit),
      fitMode: "loose",
      fabricMemory: 0.85,
      seamStressLimit: Math.min(90, constraints.seamStressCap),
    },
  };

  // 3. Foreign Body
  const foreignPlan: GenerationPlan = {
    ...faithfulPlan,
    meta: { ...faithfulPlan.meta, title: "Foreign Body Vector" },
    topology: "fractal_lattice",
    material: "void_glass",
    motionGrammar: "seismic_shudder",
    cameraGrammar: "infinite_tunnel",
    lyricBehavior: "hidden_monolith",
    temporalDensity: "intense",
    garmentParams: {
      maxStiffness: Math.min(0.8, constraints.maxStiffnessLimit),
      fitMode: "snug",
      fabricMemory: 0.2,
      seamStressLimit: Math.min(115, constraints.seamStressCap),
    },
  };

  const applyLockHelper = (plan: GenerationPlan) => {
    const { validPlan } = validatePlanAndEnforceConstraints(plan, constraints);
    return payload.lockState && payload.lockedPlan
      ? applyLocks(validPlan, payload.lockedPlan, payload.lockState)
      : validPlan;
  };

  return [
    {
      id: `prop_faithful_${seed}`,
      proposalType: "faithful",
      title: "Faithful Plan",
      tagline: "Follows strongest audio transients and lyric timestamps",
      plan: applyLockHelper(faithfulPlan),
      rationale: [
        {
          field: "topology",
          evidence: [
            {
              source: payload.mode === "lyrics_only" ? "lyrics" : "audio",
              interval: [0, 30],
              observation: "Rigid sub-bass transients mandate platonic solid geometry.",
            },
          ],
        },
      ],
      mutations: [],
      confidence: 0.92,
    },
    {
      id: `prop_mutation_${seed}`,
      proposalType: "mutation",
      title: "Mutation Vector",
      tagline: "Explores unusual organic silk wave dynamics",
      plan: applyLockHelper(mutationPlan),
      rationale: [
        {
          field: "topology",
          evidence: [
            {
              source: "seed",
              observation: "Pushed topology from platonic solids into organic ribs to explore fluid wave motion.",
            },
          ],
        },
      ],
      mutations: [
        {
          field: "topology",
          previous: "platonic_solids",
          proposed: "organic_ribs",
          reason: "Higher creative variance across motion grammar.",
        },
      ],
      confidence: 0.84,
    },
    {
      id: `prop_foreign_${seed}`,
      proposalType: "foreign_body",
      title: "Foreign Body Monolith",
      tagline: "Introduces unexplainable void-glass fractal lattice element",
      plan: applyLockHelper(foreignPlan),
      foreignElement: "An unexplainable hovering void-glass monolith with zero acoustic resonance signature",
      rationale: [
        {
          field: "material",
          evidence: [
            {
              source: "seed",
              observation: "Inserted non-acoustic void-glass monolith into scene blocks.",
            },
          ],
        },
      ],
      mutations: [
        {
          field: "foreignElement",
          previous: "none",
          proposed: "void_glass monolith",
          reason: "Deliberately introduces 1 unexplained visual element.",
        },
      ],
      confidence: 0.78,
    },
  ];
}
