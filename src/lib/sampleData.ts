/**
 * Toaster Lab - Built-in Sample Datasets for Instant Studio Testing
 */

import {
  AudioInputData,
  GarmentConstraint,
  GenerationPlan,
  ImageInputData,
  RenderReceipt,
} from "../types/toaster";

export const SAMPLE_AUDIO: AudioInputData = {
  filename: "Haunted_Resonance_Stem_128BPM.wav",
  durationSeconds: 194, // 3 mins 14s
  bpmEstimate: 128,
  keyEstimate: "D Minor",
  energyProfile: [
    0.15, 0.22, 0.28, 0.45, 0.78, 0.92, 0.88, 0.65, 0.35, 0.55, 0.82, 0.98, 0.95, 0.72, 0.41, 0.18,
  ],
};

export const SAMPLE_LYRICS = `[00:00.00] (Low sub-bass drone, static hiss)
[00:12.50] Titanium ribs under folded velvet glass
[00:24.00] The loom doesn't breathe, but the seamstress remembers
[00:38.20] Shatter the orbit before the transient settles
[00:52.00] (Heavy synth drop - staccato pulse burst)
[01:14.00] In the hyper-torus where light decays backward
[01:28.50] We drape the phantom in bioluminescent silk
[01:45.00] No shadows left in the machine, only void chrome
[02:08.00] (Seismic sub-harmonic shudder)
[02:30.00] Let the Toaster bake the unspoken artifact
[02:50.00] (Fade to zero - static dissipation)`;

export const SAMPLE_COVER_IMAGE: ImageInputData = {
  filename: "haunted_cover_art.png",
  mimeType: "image/svg+xml",
  previewUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23090d16"/><circle cx="300" cy="300" r="220" fill="none" stroke="%2338bdf8" stroke-width="3" stroke-dasharray="12 6"/><polygon points="300,120 440,380 160,380" fill="none" stroke="%23f43f5e" stroke-width="4"/><circle cx="300" cy="300" r="60" fill="%23111827" stroke="%23a855f7" stroke-width="2"/><text x="300" y="520" text-anchor="middle" fill="%2394a3b8" font-family="monospace" font-size="16" letter-spacing="4">HAUNTED TOASTER LAB</text></svg>`,
};

export const SAMPLE_GARMENT_CONSTRAINT: GarmentConstraint = {
  id: "garment_spec_alpha_2026",
  name: "Haunted Garment Spec Alpha",
  maxStiffnessLimit: 0.85,
  allowedFitModes: ["draped", "snug", "loose"],
  seamStressCap: 120,
  forbiddenColors: ["#00FF00", "#FFFF00"],
  notes: "Ensures garment deformation mesh complies with Haunted renderer physics limits.",
};

export const HISTORICAL_PLANS: GenerationPlan[] = [
  {
    meta: {
      title: "Echoes of Void Chrome",
      artist: "The Static Collective",
      seed: 1042,
      schemaVersion: "1.0.0",
      durationSeconds: 180,
      bpm: 120,
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
      maxStiffness: 0.75,
      fitMode: "draped",
      fabricMemory: 0.6,
      seamStressLimit: 110,
    },
    sceneBlocks: [
      {
        startTime: 0,
        endTime: 45,
        label: "Intro Sub Drone",
        primaryFocus: "Minimalist Geometry",
        parameterModulations: { pulseFreq: 0.5, camDist: 12 },
      },
      {
        startTime: 45,
        endTime: 120,
        label: "Main Synth Drop",
        primaryFocus: "Transient Burst",
        parameterModulations: { pulseFreq: 2.4, camDist: 4 },
      },
    ],
  },
  {
    meta: {
      title: "Bioluminescent Ribbon",
      artist: "The Static Collective",
      seed: 2099,
      schemaVersion: "1.0.0",
      durationSeconds: 210,
      bpm: 135,
    },
    topology: "organic_ribs",
    material: "bioluminescent_silk",
    paletteLogic: {
      primary: "#022C22",
      secondary: "#10B981",
      accent: "#FACC15",
      background: "#052E16",
      mood: "bioluminescent_canopy",
      shiftTrigger: "sectional",
    },
    motionGrammar: "fluid_wave",
    cameraGrammar: "spiral_zoom",
    lyricBehavior: "ambient_subtitles",
    temporalDensity: "medium",
    garmentParams: {
      maxStiffness: 0.45,
      fitMode: "loose",
      fabricMemory: 0.8,
      seamStressLimit: 95,
    },
    sceneBlocks: [
      {
        startTime: 0,
        endTime: 60,
        label: "Organic Unfurling",
        primaryFocus: "Silk Ribbon Wave",
        parameterModulations: { waveSpeed: 1.2 },
      },
    ],
  },
  {
    meta: {
      title: "Decayed Copper Monolith",
      artist: "The Static Collective",
      seed: 3301,
      schemaVersion: "1.0.0",
      durationSeconds: 190,
      bpm: 128,
    },
    topology: "fractal_lattice",
    material: "decayed_copper",
    paletteLogic: {
      primary: "#1C1917",
      secondary: "#F97316",
      accent: "#EAB308",
      background: "#0C0A09",
      mood: "ember_rust",
      shiftTrigger: "lyric_beat",
    },
    motionGrammar: "seismic_shudder",
    cameraGrammar: "static_wide",
    lyricBehavior: "carved_stone",
    temporalDensity: "intense",
    garmentParams: {
      maxStiffness: 0.8,
      fitMode: "snug",
      fabricMemory: 0.3,
      seamStressLimit: 120,
    },
    sceneBlocks: [
      {
        startTime: 0,
        endTime: 190,
        label: "Monolith Destruction",
        primaryFocus: "Fractal Shatter",
        parameterModulations: { shatterIndex: 0.85 },
      },
    ],
  },
];

export const HISTORICAL_RECEIPTS: RenderReceipt[] = [
  {
    receiptId: "rcpt_2026_0801_001",
    planId: "plan_1042",
    timestamp: "2026-08-01T14:22:10Z",
    executedPlan: HISTORICAL_PLANS[0],
    performance: {
      actualFps: 58.4,
      targetFps: 60,
      droppedFrames: 12,
      renderTimeMs: 42100,
    },
    deviations: [],
    shaderWarnings: ["Subsurface scattering raymarch count clamped to 32 on metal shader"],
    rendererVersion: "HauntedToasterCore-v2.4.1",
  },
  {
    receiptId: "rcpt_2026_0803_002",
    planId: "plan_2099",
    timestamp: "2026-08-03T09:15:44Z",
    executedPlan: {
      ...HISTORICAL_PLANS[1],
      topology: "organic_ribs",
      temporalDensity: "low",
    },
    performance: {
      actualFps: 44.2,
      targetFps: 60,
      droppedFrames: 184,
      renderTimeMs: 68900,
    },
    deviations: [
      {
        field: "temporalDensity",
        requestedValue: "medium",
        executedValue: "low",
        reason: "Bioluminescent silk particle collision solver exceeded budget (16.6ms)",
        severity: "warning",
      },
    ],
    shaderWarnings: ["GPU Memory high watermark: 8.2GB"],
    rendererVersion: "HauntedToasterCore-v2.4.1",
  },
];
