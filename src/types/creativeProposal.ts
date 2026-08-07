import type { Evidence, RationaleItem } from "./toaster";

export type CreativeProposalType =
  | "faithful"
  | "mutation"
  | "foreign_body"
  | "coverage_frontier";

/**
 * Lab-side authoring intent only.
 *
 * This is deliberately not a canonical VisualScore schema and is never
 * executable on its own. Haunted Toaster remains responsible for validation,
 * canonical addressing, resolution, and execution semantics.
 */
export interface CreativeProposal {
  id: string;
  proposalType: CreativeProposalType;
  title: string;
  tagline?: string;
  confidence?: number;
  evidence: Evidence[];
  requestedAxes: Record<string, unknown>;
  locks?: string[];
  lineage?: string[];
  rationale: RationaleItem[];
  provenance: {
    source: "gemini" | "fallback" | "user" | "lab_operation";
    deterministicReplay: boolean;
    seed?: number;
    notes?: string[];
  };
}

/**
 * Haunted Toaster's currently published canonical VisualScore v1 boundary.
 * This is a transport shape only: Toaster Lab does not validate it locally.
 */
export interface VisualScoreCandidate {
  schema: "haunted-toaster/visual-score/v1";
  seed: string;
  prng: "xoshiro256**/splitmix64-v1";
  topology: unknown;
  motion: unknown;
  palette: unknown;
  material: unknown;
  lyric: unknown;
  camera: unknown;
  temporalDensity: unknown;
  influence: unknown;
}

const CANONICAL_SCORE_KEYS = [
  "topology",
  "motion",
  "palette",
  "material",
  "lyric",
  "camera",
  "temporalDensity",
  "influence",
] as const;

/**
 * Narrow vocabulary adapter only. It copies authoring intent into Haunted
 * Toaster's published candidate envelope without validating, clamping,
 * canonicalizing, addressing, resolving, or otherwise conferring authority.
 */
export function toVisualScoreCandidate(proposal: CreativeProposal): VisualScoreCandidate {
  const axes = proposal.requestedAxes;
  const candidate: Record<string, unknown> = {
    schema: "haunted-toaster/visual-score/v1",
    seed: String(proposal.provenance.seed ?? proposal.id),
    prng: "xoshiro256**/splitmix64-v1",
  };

  for (const key of CANONICAL_SCORE_KEYS) {
    candidate[key] = axes[key];
  }

  return candidate as unknown as VisualScoreCandidate;
}

export type CanonicalValidationError = {
  path: string;
  code: string;
  message: string;
};

export type CanonicalAdmissionResult =
  | {
      status: "rejected";
      proposalId: string;
      candidate: Readonly<VisualScoreCandidate>;
      errors: readonly CanonicalValidationError[];
    }
  | {
      status: "accepted";
      proposalId: string;
      candidate: Readonly<VisualScoreCandidate>;
      canonicalScore: unknown;
      canonicalJson: string;
      canonicalScoreAddress: string;
    };

/**
 * Boundary contract implemented by Haunted Toaster integration code.
 * The implementation must delegate to Haunted Toaster's validateVisualScore()
 * (and later resolve()) rather than reimplementing canonical law in the Lab.
 */
export interface HauntedToasterAuthority {
  admit(proposal: CreativeProposal): Promise<CanonicalAdmissionResult>;
}
