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

export interface VisualScoreDescriptor {
  schemaVersion: string;
  acceptedAxes: readonly string[];
}

export interface VisualScoreCandidate {
  schemaVersion: string;
  requestedAxes: Record<string, unknown>;
  lineage?: string[];
  seed?: number;
  authoringProposalId: string;
}

/**
 * Narrow vocabulary adapter only. This function does not validate, clamp,
 * canonicalize, address, resolve, or otherwise confer execution authority.
 */
export function toVisualScoreCandidate(
  proposal: CreativeProposal,
  canonicalSchemaDescriptor: VisualScoreDescriptor
): VisualScoreCandidate {
  const requestedAxes = Object.fromEntries(
    Object.entries(proposal.requestedAxes).filter(([key]) =>
      canonicalSchemaDescriptor.acceptedAxes.includes(key)
    )
  );

  return {
    schemaVersion: canonicalSchemaDescriptor.schemaVersion,
    requestedAxes,
    lineage: proposal.lineage ? [...proposal.lineage] : undefined,
    seed: proposal.provenance.seed,
    authoringProposalId: proposal.id,
  };
}

export type CanonicalAdmissionResult =
  | {
      status: "rejected";
      proposalId: string;
      candidate: VisualScoreCandidate;
      reasons: readonly string[];
    }
  | {
      status: "accepted";
      proposalId: string;
      candidate: VisualScoreCandidate;
      canonicalScoreAddress: string;
      resolvedTimelineAddress: string;
    };

/**
 * Boundary contract implemented by Haunted Toaster integration code.
 * Toaster Lab can submit candidates and display results, but cannot implement
 * canonical admission semantics locally.
 */
export interface HauntedToasterAuthority {
  admit(candidate: VisualScoreCandidate): Promise<CanonicalAdmissionResult>;
}
