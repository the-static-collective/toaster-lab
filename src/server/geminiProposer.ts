/**
 * Toaster Lab - Server-Side Gemini API Proposer Service
 * Uses @google/genai SDK to analyze inputs and emit creative proposal material.
 *
 * IMPORTANT: Gemini output is never canonical execution state. Haunted Toaster
 * alone validates, addresses, resolves, and confers executable meaning.
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
  inspectAuthoringGuidance,
  applyLocks,
  TOPOLOGIES,
  MATERIALS,
  MOTION_GRAMMARS,
  CAMERA_GRAMMARS,
  LYRIC_BEHAVIORS,
  TEMPORAL_DENSITIES,
} from "../lib/toasterEngine";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Falling back to seeded proposal material.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy_key",
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
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
 * Compatibility surface for the existing UI. The returned `plan` is proposal
 * material only and must not be represented as accepted or executable until a
 * Haunted Toaster canonical-admission result exists.
 */
export async function generateProposals(payload: ProposeRequestPayload): Promise<PlanProposal[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const guidance = payload.garmentConstraint || DEFAULT_GARMENT_CONSTRAINT;

  if (!apiKey) return generateFallbackProposals(payload, guidance);

  try {
    const ai = getGeminiClient();
    let audioText = "";
    if (payload.mode !== "seed_only" && payload.mode !== "lyrics_only" && payload.mode !== "image_only") {
      audioText = payload.mode === "counterfactual" && payload.counterfactualRemovedModality === "audio"
        ? "AUDIO MODALITY EXCLUDED (COUNTERFACTUAL EXPERIMENT)"
        : payload.audioInfo
          ? `Audio track: ${payload.audioInfo.filename}, Duration: ${payload.audioInfo.durationSeconds}s, Estimated BPM: ${payload.audioInfo.bpmEstimate || 128}.`
          : "";
    }

    let lyricsText = "";
    if (payload.mode !== "seed_only" && payload.mode !== "audio_only" && payload.mode !== "image_only") {
      lyricsText = payload.mode === "counterfactual" && payload.counterfactualRemovedModality === "lyrics"
        ? "LYRICS MODALITY EXCLUDED (COUNTERFACTUAL EXPERIMENT)"
        : payload.lyrics ? `Song Lyrics:\n${payload.lyrics}` : "";
    }

    let imageText = "";
    if (payload.mode !== "seed_only" && payload.mode !== "audio_only" && payload.mode !== "lyrics_only") {
      imageText = payload.mode === "counterfactual" && payload.counterfactualRemovedModality === "image"
        ? "IMAGE MODALITY EXCLUDED (COUNTERFACTUAL EXPERIMENT)"
        : payload.imageInfo ? `Cover Image filename: ${payload.imageInfo.filename}` : "";
    }

    const noveltyText = payload.noveltyTarget
      ? `CREATIVE COVERAGE TARGET: topology=${payload.noveltyTarget.topology}, material=${payload.noveltyTarget.material}, motion=${payload.noveltyTarget.motionGrammar}. ${payload.noveltyTarget.rationale || ""}`
      : "";

    const lockedText = payload.lockState && payload.lockedPlan
      ? `AUTHORING LOCKS: Preserve these user-requested fields when forming proposal material: ${JSON.stringify(payload.lockState)}.`
      : "";

    const systemPrompt = `You are Toaster Lab's multimodal creative proposer for Haunted Toaster.
Produce EXACTLY 3 CREATIVE PROPOSALS: faithful, mutation, and foreign_body.

You are NOT the execution authority. Do not claim validity, canonical status, an address, a resolved timeline, or executability. Your output is authoring intent that will later be adapted and submitted to Haunted Toaster for canonical admission.

Current Lab vocabulary, for proposal guidance only:
- topology: ${TOPOLOGIES.join(", ")}
- material: ${MATERIALS.join(", ")}
- motionGrammar: ${MOTION_GRAMMARS.join(", ")}
- cameraGrammar: ${CAMERA_GRAMMARS.join(", ")}
- lyricBehavior: ${LYRIC_BEHAVIORS.join(", ")}
- temporalDensity: ${TEMPORAL_DENSITIES.join(", ")}

For every requested axis, include evidence/rationale. Do not emit rendering code. Do not describe your proposal as schema-valid merely because it fits this Lab vocabulary.`;

    const userPrompt = `Analysis Mode: ${payload.mode}
Declared authoring seed: ${payload.seed}
Authoring guidance profile: ${guidance.name}
${audioText}
${lyricsText}
${imageText}
${noveltyText}
${lockedText}

Return three proposal objects with requestedAxes, rationale, mutations, confidence, and optional foreignElement.`;

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

    const requestedAxesSchema = {
      type: Type.OBJECT,
      properties: {
        topology: { type: Type.STRING },
        material: { type: Type.STRING },
        motionGrammar: { type: Type.STRING },
        cameraGrammar: { type: Type.STRING },
        lyricBehavior: { type: Type.STRING },
        temporalDensity: { type: Type.STRING },
        paletteLogic: { type: Type.OBJECT },
        garmentParams: { type: Type.OBJECT },
      },
    };

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
              requestedAxes: requestedAxesSchema,
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
                          interval: { type: Type.ARRAY, items: { type: Type.NUMBER } },
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
      if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace === -1 || lastBrace <= firstBrace) throw e;
        parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      }
    } catch (parseErr) {
      console.warn("Failed to parse Gemini proposal JSON, returning fallbacks:", parseErr);
      return generateFallbackProposals(payload, guidance);
    }

    if (parsed?.proposals && Array.isArray(parsed.proposals) && parsed.proposals.length === 3) {
      return parsed.proposals.map((prop: any, idx: number) => {
        const proposalPlan = buildProposalPlan(payload, prop.requestedAxes || {});
        const lockedPlan = payload.lockState && payload.lockedPlan
          ? applyLocks(proposalPlan, payload.lockedPlan, payload.lockState)
          : proposalPlan;
        const guidanceWarnings = inspectAuthoringGuidance(lockedPlan, guidance);

        return {
          id: prop.id || `prop_${idx + 1}_${payload.seed}`,
          proposalType: prop.proposalType || (idx === 0 ? "faithful" : idx === 1 ? "mutation" : "foreign_body"),
          title: prop.title || (idx === 0 ? "Faithful Proposal" : idx === 1 ? "Mutation Proposal" : "Foreign Body Proposal"),
          tagline: prop.tagline || "Creative proposal material awaiting Haunted Toaster admission",
          plan: lockedPlan,
          rationale: prop.rationale || [],
          mutations: prop.mutations || [],
          confidence: typeof prop.confidence === "number" ? prop.confidence : 0.88,
          foreignElement: prop.foreignElement,
          ...(guidanceWarnings.length ? { guidanceWarnings } : {}),
        } as PlanProposal;
      });
    }

    return generateFallbackProposals(payload, guidance);
  } catch (err) {
    console.error("Gemini proposal generation error:", err);
    return generateFallbackProposals(payload, guidance);
  }
}

function buildProposalPlan(payload: ProposeRequestPayload, requestedAxes: Record<string, unknown>): GenerationPlan {
  const base = baseProposalPlan(payload);
  return {
    ...base,
    ...requestedAxes,
    meta: base.meta,
    paletteLogic: { ...base.paletteLogic, ...((requestedAxes.paletteLogic as Record<string, unknown>) || {}) } as GenerationPlan["paletteLogic"],
    garmentParams: { ...base.garmentParams, ...((requestedAxes.garmentParams as Record<string, unknown>) || {}) } as GenerationPlan["garmentParams"],
  } as GenerationPlan;
}

function baseProposalPlan(payload: ProposeRequestPayload): GenerationPlan {
  return {
    meta: {
      title: payload.audioInfo?.filename ? `Proposal: ${payload.audioInfo.filename}` : "Creative Proposal",
      artist: "Toaster Lab",
      seed: payload.seed,
      schemaVersion: "lab-proposal-compat",
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
      maxStiffness: 0.7,
      fitMode: "draped",
      fabricMemory: 0.65,
      seamStressLimit: 100,
    },
    sceneBlocks: [],
  };
}

/** Seeded local fallback for proposal material only; not canonical execution. */
export function generateFallbackProposals(
  payload: ProposeRequestPayload,
  guidance: GarmentConstraint
): PlanProposal[] {
  const seed = payload.seed;
  const faithfulPlan = baseProposalPlan(payload);
  const mutationPlan: GenerationPlan = {
    ...faithfulPlan,
    meta: { ...faithfulPlan.meta, title: "Mutation Proposal" },
    topology: (payload.noveltyTarget?.topology as GenerationPlan["topology"]) || "organic_ribs",
    material: (payload.noveltyTarget?.material as GenerationPlan["material"]) || "bioluminescent_silk",
    motionGrammar: (payload.noveltyTarget?.motionGrammar as GenerationPlan["motionGrammar"]) || "fluid_wave",
    cameraGrammar: "spiral_zoom",
    temporalDensity: "medium",
    garmentParams: { maxStiffness: 0.45, fitMode: "loose", fabricMemory: 0.85, seamStressLimit: 90 },
  };
  const foreignPlan: GenerationPlan = {
    ...faithfulPlan,
    meta: { ...faithfulPlan.meta, title: "Foreign Body Proposal" },
    topology: "fractal_lattice",
    material: "void_glass",
    motionGrammar: "seismic_shudder",
    cameraGrammar: "infinite_tunnel",
    lyricBehavior: "hidden_monolith",
    temporalDensity: "intense",
    garmentParams: { maxStiffness: 0.8, fitMode: "snug", fabricMemory: 0.2, seamStressLimit: 115 },
  };

  const preserveLocks = (plan: GenerationPlan) =>
    payload.lockState && payload.lockedPlan ? applyLocks(plan, payload.lockedPlan, payload.lockState) : plan;

  const make = (
    id: string,
    proposalType: PlanProposal["proposalType"],
    title: string,
    tagline: string,
    plan: GenerationPlan,
    rationale: RationaleItem[],
    confidence: number,
    mutations: PlanProposal["mutations"] = [],
    foreignElement?: string
  ): PlanProposal => {
    const preserved = preserveLocks(plan);
    inspectAuthoringGuidance(preserved, guidance); // inspection only; never mutates proposal
    return { id, proposalType, title, tagline, plan: preserved, rationale, mutations, confidence, foreignElement };
  };

  return [
    make(
      `prop_faithful_${seed}`,
      "faithful",
      "Faithful Proposal",
      "Follows strongest source evidence; awaits Haunted Toaster admission",
      faithfulPlan,
      [{ field: "topology", evidence: [{ source: payload.mode === "lyrics_only" ? "lyrics" : "audio", interval: [0, 30], observation: "Rigid transients suggest platonic geometry." }] }],
      0.92
    ),
    make(
      `prop_mutation_${seed}`,
      "mutation",
      "Mutation Proposal",
      "Explores an unusual combination; awaits Haunted Toaster admission",
      mutationPlan,
      [{ field: "topology", evidence: [{ source: "seed", observation: "Creative mutation requested from the declared seed." }] }],
      0.84,
      [{ field: "topology", previous: "platonic_solids", proposed: String(mutationPlan.topology), reason: "Creative variance." }]
    ),
    make(
      `prop_foreign_${seed}`,
      "foreign_body",
      "Foreign Body Proposal",
      "Introduces one unexplained visual element; awaits Haunted Toaster admission",
      foreignPlan,
      [{ field: "material", evidence: [{ source: "seed", observation: "Introduces one deliberately unexplained visual element." }] }],
      0.78,
      [{ field: "foreignElement", previous: "none", proposed: "void_glass monolith", reason: "Foreign-body exploration." }],
      "An unexplained hovering void-glass monolith"
    ),
  ];
}
