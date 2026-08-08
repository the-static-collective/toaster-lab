import assert from "node:assert/strict";
import { HISTORICAL_PLANS, SAMPLE_AUDIO, SAMPLE_COVER_IMAGE } from "../src/lib/sampleData";
import {
  toasterProposalFilename,
  toToasterProposalTransferV1,
} from "../src/lib/toasterProposalTransfer";
import type { PlanProposal } from "../src/types/toaster";

const proposal: PlanProposal = {
  id: "lab-proposal-001",
  proposalType: "mutation",
  title: "Orbital Titanium Pulse",
  tagline: "Raw Lab language stays visible while canonical vocabulary is only suggested.",
  plan: HISTORICAL_PLANS[0],
  rationale: [],
  mutations: [],
  confidence: 0.91,
};

const transferA = toToasterProposalTransferV1(proposal, {
  audio: SAMPLE_AUDIO,
  image: SAMPLE_COVER_IMAGE,
  lockState: { material: true, topology: false, motionGrammar: true },
});
const transferB = toToasterProposalTransferV1(proposal, {
  audio: SAMPLE_AUDIO,
  image: SAMPLE_COVER_IMAGE,
  lockState: { motionGrammar: true, topology: false, material: true },
});

assert.deepEqual(transferA, transferB, "transfer must be deterministic for equivalent inputs");
assert.equal(transferA.schema, "toaster-lab/proposal-transfer/v1");
assert.equal(transferA.creativeIntent.topology, "platonic_solids");
assert.equal(transferA.creativeIntent.material, "anodized_titanium");
assert.equal(transferA.creativeIntent.motionGrammar, "staccato_pulses");
assert.equal(transferA.creativeIntent.cameraGrammar, "orbital_macro");
assert.equal(transferA.suggestedVisualScore.topology, "mirrored-ring");
assert.equal(transferA.suggestedVisualScore.material.texture, "clean");
assert.equal(transferA.suggestedVisualScore.motion.grammar, "pulse");
assert.equal(transferA.suggestedVisualScore.camera.grammar, "orbit");
assert.equal(transferA.suggestedVisualScore.authority, "non-canonical-suggestion");
assert.deepEqual(transferA.locks, ["material", "motionGrammar"]);
assert.equal(transferA.assetRefs.audio?.filename, SAMPLE_AUDIO.filename);
assert.equal(transferA.assetRefs.image?.filename, SAMPLE_COVER_IMAGE.filename);
assert.equal(toasterProposalFilename(proposal), "orbital-titanium-pulse.toaster-proposal.json");

const serialized = JSON.stringify(transferA);
for (const forbidden of [
  "canonicalScoreAddress",
  "scoreAddress",
  "ResolvedTimeline",
  "resolvedTimeline",
  "timelineHash",
]) {
  assert.equal(serialized.includes(forbidden), false, `export must not contain ${forbidden}`);
}

console.log(JSON.stringify({
  proof: "GenerationPlan -> deterministic non-canonical transfer -> downloadable proposal",
  filename: toasterProposalFilename(proposal),
  rawIntent: {
    topology: transferA.creativeIntent.topology,
    motionGrammar: transferA.creativeIntent.motionGrammar,
    material: transferA.creativeIntent.material,
    cameraGrammar: transferA.creativeIntent.cameraGrammar,
  },
  suggestedCanonicalVocabulary: transferA.suggestedVisualScore,
  authority: transferA.suggestedVisualScore.authority,
}, null, 2));
