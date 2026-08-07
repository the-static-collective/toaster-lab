/**
 * Toaster Lab - authoring utilities only.
 *
 * This module may support exploration, comparison, coverage, and proposal UX.
 * It is not an execution engine. Haunted Toaster is the sole authority for
 * canonical validation, addressing, resolution, and deterministic execution.
 */

import {
  GenerationPlan,
  GarmentConstraint,
  LockState,
  RenderReceipt,
  CreativeCoverage,
  Combination,
  UnvisitedRegion,
  ReceiptDeviation,
  TopologyType,
  MaterialType,
  MotionGrammarType,
  CameraGrammarType,
  LyricBehaviorType,
  TemporalDensityType,
} from "../types/toaster";

export const TOPOLOGIES: TopologyType[] = [
  "platonic_solids",
  "organic_ribs",
  "crystalline_mesh",
  "hyper_torus",
  "folded_manifold",
  "garment_drape",
  "voxels_field",
  "fractal_lattice",
];

export const MATERIALS: MaterialType[] = [
  "anodized_titanium",
  "chrome_iridescent",
  "haunted_velvet",
  "bioluminescent_silk",
  "void_glass",
  "decayed_copper",
  "quantum_plasma",
];

export const MOTION_GRAMMARS: MotionGrammarType[] = [
  "staccato_pulses",
  "fluid_wave",
  "orbital_decay",
  "chaotic_snap",
  "harmonic_oscillation",
  "inertial_drift",
  "seismic_shudder",
];

export const CAMERA_GRAMMARS: CameraGrammarType[] = [
  "orbital_macro",
  "spiral_zoom",
  "dolly_pan",
  "static_wide",
  "shaky_cam",
  "infinite_tunnel",
];

export const LYRIC_BEHAVIORS: LyricBehaviorType[] = [
  "kinetic_type",
  "typewriter_glitch",
  "ambient_subtitles",
  "carved_stone",
  "particle_dissolve",
  "hidden_monolith",
];

export const TEMPORAL_DENSITIES: TemporalDensityType[] = ["low", "medium", "high", "intense"];

/**
 * Legacy Lab-side constraints retained only as creative guidance for the UI and
 * proposal prompts. They must never be treated as canonical admission rules.
 */
export const DEFAULT_GARMENT_CONSTRAINT: GarmentConstraint = {
  id: "standard_haunted_garment_v1",
  name: "Haunted Garment Spec A",
  maxStiffnessLimit: 0.85,
  allowedFitModes: ["draped", "snug", "loose"],
  seamStressCap: 120,
  forbiddenColors: ["#00FF00", "#FFFF00"],
  forbiddenTopologies: [],
  notes: "Authoring guidance only. Haunted Toaster owns canonical validation.",
};

/**
 * Inspect a proposal against Lab-side authoring guidance without changing it.
 * Canonical acceptance or rejection must come from Haunted Toaster.
 */
export function inspectAuthoringGuidance(
  plan: GenerationPlan,
  constraints: GarmentConstraint = DEFAULT_GARMENT_CONSTRAINT
): string[] {
  const warnings: string[] = [];

  if (plan.garmentParams.maxStiffness > constraints.maxStiffnessLimit) {
    warnings.push(`Garment stiffness ${plan.garmentParams.maxStiffness} exceeds authoring guidance ${constraints.maxStiffnessLimit}.`);
  }
  if (!constraints.allowedFitModes.includes(plan.garmentParams.fitMode)) {
    warnings.push(`Fit mode '${plan.garmentParams.fitMode}' is outside current authoring guidance.`);
  }
  if (plan.garmentParams.seamStressLimit > constraints.seamStressCap) {
    warnings.push(`Seam stress ${plan.garmentParams.seamStressLimit} exceeds authoring guidance ${constraints.seamStressCap}.`);
  }

  const forbidden = constraints.forbiddenColors.map((c) => c.toUpperCase());
  if (forbidden.includes(plan.paletteLogic.primary.toUpperCase())) {
    warnings.push(`Primary color ${plan.paletteLogic.primary} is outside current authoring guidance.`);
  }
  if (forbidden.includes(plan.paletteLogic.secondary.toUpperCase())) {
    warnings.push(`Secondary color ${plan.paletteLogic.secondary} is outside current authoring guidance.`);
  }

  return warnings;
}

/** Apply UI locks as an authoring operation. This does not canonicalize a plan. */
export function applyLocks(
  targetPlan: GenerationPlan,
  lockedPlan: GenerationPlan | null,
  lockState: LockState
): GenerationPlan {
  if (!lockedPlan) return targetPlan;
  const result = JSON.parse(JSON.stringify(targetPlan)) as GenerationPlan;

  if (lockState.topology) result.topology = lockedPlan.topology;
  if (lockState.material) result.material = lockedPlan.material;
  if (lockState.paletteLogic) result.paletteLogic = JSON.parse(JSON.stringify(lockedPlan.paletteLogic));
  if (lockState.motionGrammar) result.motionGrammar = lockedPlan.motionGrammar;
  if (lockState.cameraGrammar) result.cameraGrammar = lockedPlan.cameraGrammar;
  if (lockState.lyricBehavior) result.lyricBehavior = lockedPlan.lyricBehavior;
  if (lockState.temporalDensity) result.temporalDensity = lockedPlan.temporalDensity;
  if (lockState.garmentParams) result.garmentParams = JSON.parse(JSON.stringify(lockedPlan.garmentParams));

  return result;
}

/**
 * Deterministic authoring reroll.
 *
 * This seed only selects proposal material. It does not define Haunted Toaster
 * execution semantics or replace Haunted Toaster's canonical PRNG/resolver.
 */
function seededAuthoringChoice(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function rerollAxis(
  currentPlan: GenerationPlan,
  axisKey: keyof GenerationPlan,
  seed: number,
  constraints: GarmentConstraint = DEFAULT_GARMENT_CONSTRAINT
): { newPlan: GenerationPlan; mutationReason: string; guidanceWarnings: string[] } {
  const rng = seededAuthoringChoice(seed);
  const plan = JSON.parse(JSON.stringify(currentPlan)) as GenerationPlan;
  let mutationReason = "";

  switch (axisKey) {
    case "topology": {
      const available = TOPOLOGIES.filter((t) => t !== plan.topology);
      const chosen = available[Math.floor(rng() * available.length)];
      plan.topology = chosen;
      mutationReason = `Requested topology mutation from ${currentPlan.topology} to ${chosen}.`;
      break;
    }
    case "material": {
      const available = MATERIALS.filter((m) => m !== plan.material);
      const chosen = available[Math.floor(rng() * available.length)];
      plan.material = chosen;
      mutationReason = `Requested material mutation from ${currentPlan.material} to ${chosen}.`;
      break;
    }
    case "motionGrammar": {
      const available = MOTION_GRAMMARS.filter((m) => m !== plan.motionGrammar);
      const chosen = available[Math.floor(rng() * available.length)];
      plan.motionGrammar = chosen;
      mutationReason = `Requested motion mutation from ${currentPlan.motionGrammar} to ${chosen}.`;
      break;
    }
    case "cameraGrammar": {
      const available = CAMERA_GRAMMARS.filter((c) => c !== plan.cameraGrammar);
      const chosen = available[Math.floor(rng() * available.length)];
      plan.cameraGrammar = chosen;
      mutationReason = `Requested camera mutation from ${currentPlan.cameraGrammar} to ${chosen}.`;
      break;
    }
    case "lyricBehavior": {
      const available = LYRIC_BEHAVIORS.filter((l) => l !== plan.lyricBehavior);
      const chosen = available[Math.floor(rng() * available.length)];
      plan.lyricBehavior = chosen;
      mutationReason = `Requested lyric mutation from ${currentPlan.lyricBehavior} to ${chosen}.`;
      break;
    }
    case "temporalDensity": {
      const available = TEMPORAL_DENSITIES.filter((d) => d !== plan.temporalDensity);
      const chosen = available[Math.floor(rng() * available.length)];
      plan.temporalDensity = chosen;
      mutationReason = `Requested temporal-density mutation from ${currentPlan.temporalDensity} to ${chosen}.`;
      break;
    }
    case "garmentParams": {
      const fit = constraints.allowedFitModes[Math.floor(rng() * constraints.allowedFitModes.length)] || plan.garmentParams.fitMode;
      plan.garmentParams = {
        ...plan.garmentParams,
        maxStiffness: Number((0.2 + rng() * 0.8).toFixed(2)),
        fitMode: fit,
        fabricMemory: Number((0.1 + rng() * 0.8).toFixed(2)),
      };
      mutationReason = "Requested a new garment-parameter proposal from the declared authoring seed.";
      break;
    }
    case "paletteLogic": {
      const palettes = [
        { primary: "#0F172A", secondary: "#38BDF8", accent: "#F43F5E", background: "#020617", mood: "cyber_twilight" },
        { primary: "#1C1917", secondary: "#F97316", accent: "#EAB308", background: "#0C0A09", mood: "ember_rust" },
        { primary: "#111827", secondary: "#A855F7", accent: "#06B6D4", background: "#030712", mood: "void_aurora" },
        { primary: "#052E16", secondary: "#10B981", accent: "#FACC15", background: "#022C22", mood: "bioluminescent_canopy" },
      ];
      const chosen = palettes[Math.floor(rng() * palettes.length)];
      plan.paletteLogic = { ...chosen, shiftTrigger: plan.paletteLogic.shiftTrigger };
      mutationReason = `Requested palette mood '${chosen.mood}'.`;
      break;
    }
    default:
      mutationReason = `No authoring mutation handler for axis ${String(axisKey)}.`;
  }

  return { newPlan: plan, mutationReason, guidanceWarnings: inspectAuthoringGuidance(plan, constraints) };
}

/**
 * Blend two plans as proposal material only. Result must pass through Haunted
 * Toaster canonical admission before it can become executable state.
 */
export function breedPlans(
  planA: GenerationPlan,
  planB: GenerationPlan,
  blend: number,
  seed: number = 42
): GenerationPlan {
  const blendClamped = Math.max(0, Math.min(1, blend));
  const result = JSON.parse(JSON.stringify(planA)) as GenerationPlan;
  result.meta.title = `${planA.meta.title} × ${planB.meta.title} (${Math.round(blendClamped * 100)}% B)`;
  result.meta.seed = seed;
  result.topology = blendClamped < 0.5 ? planA.topology : planB.topology;
  result.material = blendClamped < 0.5 ? planA.material : planB.material;
  result.motionGrammar = blendClamped < 0.5 ? planA.motionGrammar : planB.motionGrammar;
  result.cameraGrammar = blendClamped < 0.5 ? planA.cameraGrammar : planB.cameraGrammar;
  result.lyricBehavior = blendClamped < 0.5 ? planA.lyricBehavior : planB.lyricBehavior;
  result.temporalDensity = blendClamped < 0.5 ? planA.temporalDensity : planB.temporalDensity;

  const stiffA = planA.garmentParams?.maxStiffness ?? 0.5;
  const stiffB = planB.garmentParams?.maxStiffness ?? 0.5;
  const memA = planA.garmentParams?.fabricMemory ?? 0.5;
  const memB = planB.garmentParams?.fabricMemory ?? 0.5;
  const seamA = planA.garmentParams?.seamStressLimit ?? 100;
  const seamB = planB.garmentParams?.seamStressLimit ?? 100;

  result.garmentParams = {
    maxStiffness: Number((stiffA * (1 - blendClamped) + stiffB * blendClamped).toFixed(2)),
    fitMode: blendClamped < 0.5 ? planA.garmentParams.fitMode : planB.garmentParams.fitMode,
    fabricMemory: Number((memA * (1 - blendClamped) + memB * blendClamped).toFixed(2)),
    seamStressLimit: Math.round(seamA * (1 - blendClamped) + seamB * blendClamped),
  };

  if (blendClamped < 0.3) {
    result.paletteLogic = JSON.parse(JSON.stringify(planA.paletteLogic));
  } else if (blendClamped > 0.7) {
    result.paletteLogic = JSON.parse(JSON.stringify(planB.paletteLogic));
  } else {
    result.paletteLogic = {
      primary: planA.paletteLogic.primary,
      secondary: planB.paletteLogic.secondary,
      accent: planB.paletteLogic.accent,
      background: planA.paletteLogic.background,
      mood: `${planA.paletteLogic.mood}_hybrid_${planB.paletteLogic.mood}`,
      shiftTrigger: blendClamped < 0.5 ? planA.paletteLogic.shiftTrigger : planB.paletteLogic.shiftTrigger,
    };
  }

  return result;
}

export function diffPlans(
  planA: GenerationPlan,
  planB: GenerationPlan
): { field: string; valA: unknown; valB: unknown; equal: boolean }[] {
  const fields = [
    "topology",
    "material",
    "motionGrammar",
    "cameraGrammar",
    "lyricBehavior",
    "temporalDensity",
    "paletteLogic.mood",
    "paletteLogic.primary",
    "paletteLogic.shiftTrigger",
    "garmentParams.maxStiffness",
    "garmentParams.fitMode",
  ];

  return fields.map((field) => {
    const valA = getNestedValue(planA, field);
    const valB = getNestedValue(planB, field);
    return { field, valA, valB, equal: JSON.stringify(valA) === JSON.stringify(valB) };
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export function compareReceiptWithPlan(
  plan: GenerationPlan,
  receipt: RenderReceipt
): {
  matchScore: number;
  deviations: ReceiptDeviation[];
  warnings: string[];
  performance: RenderReceipt["performance"];
} {
  const deviations: ReceiptDeviation[] = [...receipt.deviations];
  const warnings: string[] = [...receipt.shaderWarnings];

  if (plan.topology !== receipt.executedPlan.topology) {
    deviations.push({
      field: "topology",
      requestedValue: plan.topology,
      executedValue: receipt.executedPlan.topology,
      reason: "Renderer topology fallback due to vertex limit on platform",
      severity: "fallback",
    });
  }

  if (plan.temporalDensity !== receipt.executedPlan.temporalDensity) {
    deviations.push({
      field: "temporalDensity",
      requestedValue: plan.temporalDensity,
      executedValue: receipt.executedPlan.temporalDensity,
      reason: "Throttled down frame rate sync frequency to prevent dropped frames",
      severity: "warning",
    });
  }

  const fallbackCount = deviations.filter((d) => d.severity === "fallback").length;
  const warningCount = deviations.filter((d) => d.severity === "warning").length;
  const matchScore = Math.max(0, Math.min(100, Math.round(100 - fallbackCount * 18 - warningCount * 8)));

  return { matchScore, deviations, warnings, performance: receipt.performance };
}

export function computeCreativeCoverage(
  plans: GenerationPlan[],
  receipts: RenderReceipt[] = []
): CreativeCoverage {
  const allPlans = [...plans, ...receipts.map((r) => r.executedPlan)];
  const totalPlansAnalyzed = allPlans.length;
  const topologyPairsUsed: Record<string, number> = {};
  const paletteMotionPairsUsed: Record<string, number> = {};
  const temporalDensityDistribution: Record<string, number> = {};
  const comboCounts: Record<string, Combination> = {};

  allPlans.forEach((p) => {
    const topMat = `${p.topology}::${p.material}`;
    topologyPairsUsed[topMat] = (topologyPairsUsed[topMat] || 0) + 1;
    const palMot = `${p.paletteLogic?.mood || "default"}::${p.motionGrammar}`;
    paletteMotionPairsUsed[palMot] = (paletteMotionPairsUsed[palMot] || 0) + 1;
    const td = p.temporalDensity || "medium";
    temporalDensityDistribution[td] = (temporalDensityDistribution[td] || 0) + 1;

    const comboKey = `${p.topology}__${p.motionGrammar}__${p.material}`;
    if (!comboCounts[comboKey]) {
      comboCounts[comboKey] = { topology: p.topology, motionGrammar: p.motionGrammar, material: p.material, count: 0 };
    }
    comboCounts[comboKey].count += 1;
  });

  const combosArray = Object.values(comboCounts);
  const overusedCombinations = [...combosArray].sort((a, b) => b.count - a.count).slice(0, 5);
  const rareCombinations = [...combosArray].filter((c) => c.count <= 2).slice(0, 5);
  const unvisitedRegions: UnvisitedRegion[] = [];

  for (const top of TOPOLOGIES) {
    for (const motion of MOTION_GRAMMARS) {
      for (const mat of MATERIALS) {
        const key = `${top}__${motion}__${mat}`;
        if (!comboCounts[key] && unvisitedRegions.length < 12) {
          unvisitedRegions.push({
            topology: top,
            motionGrammar: motion,
            material: mat,
            rationale: `Underexplored combination: ${top} paired with ${motion} motion in ${mat} material canvas.`,
          });
        }
      }
    }
  }

  return {
    totalPlansAnalyzed,
    topologyPairsUsed,
    paletteMotionPairsUsed,
    temporalDensityDistribution,
    rareCombinations,
    overusedCombinations,
    unvisitedRegions,
  };
}

export function getUnvisitedTarget(coverage: CreativeCoverage, seed: number): UnvisitedRegion {
  if (coverage.unvisitedRegions.length > 0) {
    const idx = Math.abs(seed) % coverage.unvisitedRegions.length;
    return coverage.unvisitedRegions[idx];
  }
  return {
    topology: "hyper_torus",
    motionGrammar: "seismic_shudder",
    material: "void_glass",
    rationale: "Forced frontier coordinate: hyper_torus with seismic_shudder in void_glass.",
  };
}
