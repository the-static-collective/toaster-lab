import type {
  AudioInputData,
  GenerationPlan,
  ImageInputData,
  LockState,
  PlanProposal,
} from "../types/toaster";

export type SuggestedTopology = "linear" | "circle" | "mirrored-ring";
export type SuggestedMotionGrammar = "still" | "drift" | "pulse" | "orbit" | "fracture";
export type SuggestedMaterialTexture = "clean" | "grain" | "photocopy" | "gate-weave";
export type SuggestedCameraGrammar = "locked" | "drift" | "push" | "orbit";
export type SuggestedTemporalDensity = "frozen" | "section" | "phrase";
export type SuggestedPaletteLogic = "garment" | "analogous" | "duotone";
export type SuggestedLyricPlacement = "lower-third" | "center" | "ghost";

export interface SuggestedVisualScoreV1 {
  schema: "toaster-lab/suggested-visual-score/v1";
  authority: "non-canonical-suggestion";
  topology: SuggestedTopology;
  motion: { grammar: SuggestedMotionGrammar };
  palette: { logic: SuggestedPaletteLogic };
  material: { texture: SuggestedMaterialTexture };
  lyric: { placement: SuggestedLyricPlacement };
  camera: { grammar: SuggestedCameraGrammar };
  temporalDensity: SuggestedTemporalDensity;
}

export interface ToasterProposalTransferV1 {
  schema: "toaster-lab/proposal-transfer/v1";
  proposal: {
    id: string;
    proposalType: PlanProposal["proposalType"];
    title: string;
    tagline: string;
    confidence: number;
    rationale: PlanProposal["rationale"];
    mutations: PlanProposal["mutations"];
    foreignElement?: string;
  };
  creativeIntent: GenerationPlan;
  suggestedVisualScore: SuggestedVisualScoreV1;
  assetRefs: {
    audio?: { filename: string; durationSeconds: number };
    image?: { filename: string; mimeType: string };
  };
  locks: string[];
  provenance: {
    source: "toaster-lab";
    adapter: "generation-plan-to-proposal-transfer/v1";
    seed: number;
    generationPlanSchemaVersion: string;
    note: "Suggestion only. Haunted Toaster owns validation, canonical addressing, resolution, and execution.";
  };
}

const TOPOLOGY_TRANSLATION: Record<GenerationPlan["topology"], SuggestedTopology> = {
  platonic_solids: "mirrored-ring",
  organic_ribs: "linear",
  crystalline_mesh: "mirrored-ring",
  hyper_torus: "circle",
  folded_manifold: "mirrored-ring",
  garment_drape: "linear",
  voxels_field: "linear",
  fractal_lattice: "mirrored-ring",
};

const MOTION_TRANSLATION: Record<GenerationPlan["motionGrammar"], SuggestedMotionGrammar> = {
  staccato_pulses: "pulse",
  fluid_wave: "drift",
  orbital_decay: "orbit",
  chaotic_snap: "fracture",
  harmonic_oscillation: "pulse",
  inertial_drift: "drift",
  seismic_shudder: "fracture",
};

const MATERIAL_TRANSLATION: Record<GenerationPlan["material"], SuggestedMaterialTexture> = {
  anodized_titanium: "clean",
  chrome_iridescent: "clean",
  haunted_velvet: "grain",
  bioluminescent_silk: "gate-weave",
  void_glass: "clean",
  decayed_copper: "grain",
  quantum_plasma: "photocopy",
};

const CAMERA_TRANSLATION: Record<GenerationPlan["cameraGrammar"], SuggestedCameraGrammar> = {
  orbital_macro: "orbit",
  spiral_zoom: "push",
  dolly_pan: "drift",
  static_wide: "locked",
  shaky_cam: "drift",
  infinite_tunnel: "push",
};

const TEMPORAL_TRANSLATION: Record<GenerationPlan["temporalDensity"], SuggestedTemporalDensity> = {
  low: "frozen",
  medium: "section",
  high: "phrase",
  intense: "phrase",
};

const LYRIC_TRANSLATION: Record<GenerationPlan["lyricBehavior"], SuggestedLyricPlacement> = {
  kinetic_type: "center",
  typewriter_glitch: "center",
  ambient_subtitles: "lower-third",
  carved_stone: "center",
  particle_dissolve: "ghost",
  hidden_monolith: "ghost",
};

function suggestPaletteLogic(plan: GenerationPlan): SuggestedPaletteLogic {
  if (plan.paletteLogic.shiftTrigger === "stasis") return "garment";
  if (plan.paletteLogic.shiftTrigger === "sectional") return "duotone";
  return "analogous";
}

function lockedAxes(lockState: LockState): string[] {
  return Object.keys(lockState)
    .filter((key) => lockState[key])
    .sort();
}

export function toToasterProposalTransferV1(
  proposal: PlanProposal,
  context: {
    audio: AudioInputData | null;
    image: ImageInputData | null;
    lockState: LockState;
  },
): ToasterProposalTransferV1 {
  const { plan } = proposal;

  return {
    schema: "toaster-lab/proposal-transfer/v1",
    proposal: {
      id: proposal.id,
      proposalType: proposal.proposalType,
      title: proposal.title,
      tagline: proposal.tagline,
      confidence: proposal.confidence,
      rationale: proposal.rationale,
      mutations: proposal.mutations,
      ...(proposal.foreignElement ? { foreignElement: proposal.foreignElement } : {}),
    },
    creativeIntent: plan,
    suggestedVisualScore: {
      schema: "toaster-lab/suggested-visual-score/v1",
      authority: "non-canonical-suggestion",
      topology: TOPOLOGY_TRANSLATION[plan.topology],
      motion: { grammar: MOTION_TRANSLATION[plan.motionGrammar] },
      palette: { logic: suggestPaletteLogic(plan) },
      material: { texture: MATERIAL_TRANSLATION[plan.material] },
      lyric: { placement: LYRIC_TRANSLATION[plan.lyricBehavior] },
      camera: { grammar: CAMERA_TRANSLATION[plan.cameraGrammar] },
      temporalDensity: TEMPORAL_TRANSLATION[plan.temporalDensity],
    },
    assetRefs: {
      ...(context.audio
        ? { audio: { filename: context.audio.filename, durationSeconds: context.audio.durationSeconds } }
        : {}),
      ...(context.image
        ? { image: { filename: context.image.filename, mimeType: context.image.mimeType } }
        : {}),
    },
    locks: lockedAxes(context.lockState),
    provenance: {
      source: "toaster-lab",
      adapter: "generation-plan-to-proposal-transfer/v1",
      seed: plan.meta.seed,
      generationPlanSchemaVersion: plan.meta.schemaVersion,
      note: "Suggestion only. Haunted Toaster owns validation, canonical addressing, resolution, and execution.",
    },
  };
}

export function toasterProposalFilename(proposal: PlanProposal): string {
  const slug = proposal.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || proposal.id;
  return `${slug}.toaster-proposal.json`;
}
