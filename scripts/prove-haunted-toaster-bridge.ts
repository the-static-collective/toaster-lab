import assert from "node:assert/strict";
import { hauntedToasterAuthority } from "../src/server/hauntedToasterAuthority";
import type { CreativeProposal } from "../src/types/creativeProposal";

const proposal: CreativeProposal = {
  id: "bridge-proof-001",
  proposalType: "faithful",
  title: "Canonical bridge proof",
  evidence: [],
  requestedAxes: {
    topology: "circle",
    motion: { grammar: "drift", amplitude: 0.3, variance: 0.1 },
    palette: { logic: "analogous", bleed: 0.4, contrastBias: 0 },
    material: { texture: "grain", imperfection: 0.2 },
    lyric: { placement: "center", densityBias: 0 },
    camera: { grammar: "drift", variance: 0.1 },
    temporalDensity: "section",
    influence: {
      energyBias: 0,
      transientDensity: 0.2,
      lyricDensity: 0.2,
      contrastBias: 0,
      motionVariance: 0.2,
      imperfection: 0.2,
    },
  },
  rationale: [],
  provenance: {
    source: "user",
    deterministicReplay: true,
    seed: 4242,
  },
};

const analysis = {
  schema: "haunted-toaster/audio-analysis-fixture/v1",
  durationSeconds: 60,
  sections: [
    { startSeconds: 0, endSeconds: 30, energy: 0.18, label: "Hush" },
    { startSeconds: 30, endSeconds: 60, energy: 0.38, label: "Lift" },
  ],
  phrases: [
    { atSeconds: 15, energy: 0.2 },
    { atSeconds: 30, energy: 0.35 },
    { atSeconds: 45, energy: 0.4 },
  ],
  transients: [{ atSeconds: 30, energy: 0.48 }],
};

const constraints = {
  schema: "haunted-toaster/garment-constraints/v1",
  id: "bridge-proof-v1",
  topology: { allowed: ["linear", "circle"] },
  motion: {
    grammar: { allowed: ["still", "drift", "pulse", "orbit"] },
    amplitude: { min: 0.12, max: 0.72 },
    variance: { min: 0.04, max: 0.45 },
  },
  palette: {
    logic: { allowed: ["garment", "analogous", "duotone"] },
    bleed: { min: 0.18, max: 0.74 },
    contrastBias: { min: -0.25, max: 0.42 },
  },
  material: {
    texture: { allowed: ["clean", "grain", "gate-weave"] },
    imperfection: { min: 0.04, max: 0.48 },
  },
  lyric: {
    placement: { allowed: ["lower-third", "center", "ghost"] },
    densityBias: { min: -0.35, max: 0.35 },
  },
  camera: {
    grammar: { allowed: ["locked", "drift", "push", "orbit"] },
    variance: { min: 0.02, max: 0.42 },
  },
  temporalDensity: { allowed: ["frozen", "section", "phrase"] },
  influence: {
    energyBias: { min: -0.5, max: 0.6 },
    transientDensity: { min: 0, max: 0.55 },
    lyricDensity: { min: 0, max: 0.7 },
    contrastBias: { min: -0.4, max: 0.5 },
    motionVariance: { min: 0, max: 0.55 },
    imperfection: { min: 0, max: 0.5 },
  },
  patchPolicy: {
    maxPatches: 16,
    entropyBudget: 40,
    axes: {
      motion: { boundaries: ["section", "phrase"], transition: "interpolate", entropyCost: 4 },
      palette: { boundaries: ["section"], transition: "crossfade", entropyCost: 5 },
      material: { boundaries: ["section", "phrase"], transition: "interpolate", entropyCost: 3 },
      lyric: { boundaries: ["phrase"], transition: "crossfade", entropyCost: 3 },
      camera: { boundaries: ["section", "phrase"], transition: "interpolate", entropyCost: 4 },
    },
  },
};

const profile = {
  schema: "haunted-toaster/renderer-profile/v1",
  id: "toaster-raster-1",
  canvas: { width: 1920, height: 1080, fps: 30 },
  timebase: 1000,
  colorSpace: "srgb",
  fontAssets: {
    title: "a286eb923f951bebbfdd3dac0cf7aa1b1ddafb651e80ffde8200a7279151bad3",
    lyrics: "267de93f73f627e99cd996d3412a94509e715ab29b4dd98869f2c02e85c64392",
  },
  encoder: { codec: "h264", profile: "high-4.2", pixelFormat: "yuv420p", crf: 19 },
};

const result = await hauntedToasterAuthority.admitAndResolve(
  proposal,
  analysis,
  constraints,
  profile,
);

assert.equal(result.status, "resolved", JSON.stringify(result));
if (result.status !== "resolved") process.exit(1);

assert.match(result.canonicalScoreAddress, /^htvs1_[0-9a-f]{64}$/);
assert.ok(result.canonicalScore);
assert.ok(result.resolvedTimeline);

const timeline = result.resolvedTimeline as {
  scoreAddress?: string;
  timelineHash?: string;
  durationTicks?: number;
};
assert.equal(timeline.scoreAddress, result.canonicalScoreAddress);
assert.match(String(timeline.timelineHash), /^[0-9a-f]{64}$/);
assert.equal(timeline.durationTicks, 60_000);

console.log(JSON.stringify({
  proof: "CreativeProposal -> candidate score -> HT validation -> address -> ResolvedTimeline",
  proposalId: result.proposalId,
  canonicalScoreAddress: result.canonicalScoreAddress,
  timelineHash: timeline.timelineHash,
  durationTicks: timeline.durationTicks,
}, null, 2));