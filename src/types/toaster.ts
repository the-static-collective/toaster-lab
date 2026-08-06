/**
 * Toaster Lab - Core Type Definitions for Haunted Toaster Workbench
 */

export type TopologyType =
  | "platonic_solids"
  | "organic_ribs"
  | "crystalline_mesh"
  | "hyper_torus"
  | "folded_manifold"
  | "garment_drape"
  | "voxels_field"
  | "fractal_lattice";

export type MaterialType =
  | "anodized_titanium"
  | "chrome_iridescent"
  | "haunted_velvet"
  | "bioluminescent_silk"
  | "void_glass"
  | "decayed_copper"
  | "quantum_plasma";

export type ShiftTriggerType = "transient" | "lyric_beat" | "sectional" | "stasis";

export interface PaletteLogic {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  mood: string;
  shiftTrigger: ShiftTriggerType;
}

export type MotionGrammarType =
  | "staccato_pulses"
  | "fluid_wave"
  | "orbital_decay"
  | "chaotic_snap"
  | "harmonic_oscillation"
  | "inertial_drift"
  | "seismic_shudder";

export type CameraGrammarType =
  | "orbital_macro"
  | "spiral_zoom"
  | "dolly_pan"
  | "static_wide"
  | "shaky_cam"
  | "infinite_tunnel";

export type LyricBehaviorType =
  | "kinetic_type"
  | "typewriter_glitch"
  | "ambient_subtitles"
  | "carved_stone"
  | "particle_dissolve"
  | "hidden_monolith";

export type TemporalDensityType = "low" | "medium" | "high" | "intense";

export interface GarmentParams {
  maxStiffness: number; // 0.0 to 1.0
  fitMode: "snug" | "draped" | "loose" | "pressurized";
  fabricMemory: number; // 0.0 to 1.0
  seamStressLimit: number; // MPa
  forbiddenColors?: string[];
}

export interface SceneBlock {
  startTime: number; // seconds
  endTime: number; // seconds
  label: string;
  primaryFocus: string;
  parameterModulations: Record<string, string | number>;
}

export interface GenerationPlanMeta {
  title: string;
  artist: string;
  seed: number;
  schemaVersion: string;
  durationSeconds: number;
  bpm?: number;
}

export interface GenerationPlan {
  meta: GenerationPlanMeta;
  topology: TopologyType;
  material: MaterialType;
  paletteLogic: PaletteLogic;
  motionGrammar: MotionGrammarType;
  cameraGrammar: CameraGrammarType;
  lyricBehavior: LyricBehaviorType;
  temporalDensity: TemporalDensityType;
  garmentParams: GarmentParams;
  sceneBlocks: SceneBlock[];
}

export interface Evidence {
  source: "audio" | "lyrics" | "image" | "seed" | "constraint";
  interval?: [number, number]; // [startSec, endSec]
  excerpt?: string;
  observation: string;
}

export interface RationaleItem {
  field: string;
  evidence: Evidence[];
}

export interface MutationItem {
  field: string;
  previous: unknown;
  proposed: unknown;
  reason: string;
}

export type ProposalType = "faithful" | "mutation" | "foreign_body";

export interface PlanProposal {
  id: string;
  proposalType: ProposalType;
  title: string;
  tagline: string;
  plan: GenerationPlan;
  rationale: RationaleItem[];
  mutations: MutationItem[];
  confidence: number; // 0 to 1
  foreignElement?: string; // described element if proposalType === 'foreign_body'
}

export interface GarmentConstraint {
  id: string;
  name: string;
  maxStiffnessLimit: number;
  allowedFitModes: ("snug" | "draped" | "loose" | "pressurized")[];
  seamStressCap: number;
  forbiddenColors: string[];
  forbiddenTopologies?: TopologyType[];
  notes?: string;
}

export interface PerformanceStats {
  actualFps: number;
  targetFps: number;
  droppedFrames: number;
  renderTimeMs: number;
}

export interface ReceiptDeviation {
  field: string;
  requestedValue: unknown;
  executedValue: unknown;
  reason: string;
  severity: "warning" | "fallback" | "info";
}

export interface RenderReceipt {
  receiptId: string;
  planId: string;
  timestamp: string;
  executedPlan: GenerationPlan;
  performance: PerformanceStats;
  deviations: ReceiptDeviation[];
  shaderWarnings: string[];
  rendererVersion: string;
}

export interface Combination {
  topology: TopologyType;
  motionGrammar: MotionGrammarType;
  material: MaterialType;
  count: number;
}

export interface UnvisitedRegion {
  topology: TopologyType;
  motionGrammar: MotionGrammarType;
  material: MaterialType;
  rationale: string;
}

export interface CreativeCoverage {
  totalPlansAnalyzed: number;
  topologyPairsUsed: Record<string, number>;
  paletteMotionPairsUsed: Record<string, number>;
  temporalDensityDistribution: Record<string, number>;
  rareCombinations: Combination[];
  overusedCombinations: Combination[];
  unvisitedRegions: UnvisitedRegion[];
}

export type AnalysisMode =
  | "full"
  | "audio_only"
  | "lyrics_only"
  | "image_only"
  | "seed_only"
  | "counterfactual";

export type LockState = Record<string, boolean>;

export interface AudioInputData {
  filename: string;
  durationSeconds: number;
  bpmEstimate?: number;
  keyEstimate?: string;
  energyProfile?: number[]; // normalized 0..1 array across duration
  base64?: string;
}

export interface ImageInputData {
  filename: string;
  mimeType: string;
  base64?: string;
  previewUrl?: string;
}

export interface WorkbenchState {
  audio: AudioInputData | null;
  lyrics: string;
  image: ImageInputData | null;
  seed: number;
  garmentConstraint: GarmentConstraint;
  historicalPlans: GenerationPlan[];
  historicalReceipts: RenderReceipt[];
  analysisMode: AnalysisMode;
  counterfactualRemovedModality: "audio" | "lyrics" | "image";
  lockState: LockState;
  lockedPlan: GenerationPlan | null;
}
