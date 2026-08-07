import {
  addressVisualScore,
  resolve,
  validateVisualScore,
} from "haunted-toaster/generation";
import {
  toVisualScoreCandidate,
  type CanonicalAdmissionResult,
  type CreativeProposal,
  type HauntedToasterAuthority,
} from "../types/creativeProposal";

export type CanonicalResolutionResult =
  | CanonicalAdmissionResult
  | {
      status: "resolved";
      proposalId: string;
      canonicalScore: unknown;
      canonicalScoreAddress: string;
      resolvedTimeline: unknown;
    };

/**
 * Concrete authority adapter. No canonical law lives here: every acceptance,
 * address, and executable timeline is delegated to Haunted Toaster.
 */
export class CanonicalHauntedToasterAuthority implements HauntedToasterAuthority {
  async admit(proposal: CreativeProposal): Promise<CanonicalAdmissionResult> {
    const candidate = Object.freeze(toVisualScoreCandidate(proposal));
    const validation = validateVisualScore(candidate);

    if (validation.ok === false) {
      return {
        status: "rejected",
        proposalId: proposal.id,
        candidate,
        errors: validation.errors,
      };
    }

    return {
      status: "accepted",
      proposalId: proposal.id,
      candidate,
      canonicalScore: validation.value,
      canonicalJson: validation.canonicalJson,
      canonicalScoreAddress: addressVisualScore(validation.value),
    };
  }

  async admitAndResolve(
    proposal: CreativeProposal,
    analysis: unknown,
    constraints: unknown,
    profile: unknown,
  ): Promise<CanonicalResolutionResult> {
    const admission = await this.admit(proposal);
    if (admission.status === "rejected") return admission;

    const resolvedTimeline = resolve(
      analysis,
      admission.canonicalScore,
      constraints,
      profile,
    );

    return {
      status: "resolved",
      proposalId: proposal.id,
      canonicalScore: admission.canonicalScore,
      canonicalScoreAddress: admission.canonicalScoreAddress,
      resolvedTimeline,
    };
  }
}

export const hauntedToasterAuthority = new CanonicalHauntedToasterAuthority();