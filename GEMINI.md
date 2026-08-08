# Toast Lab — AI Studio build contract

This file is the first instruction for any Gemini / AI Studio remix of this repository.

## Product law

Toast Lab is not a chat application and not a second Haunted Toaster.

Toast Lab has one job:

> Receive a song, artwork, and lyrics; preprocess them; let Gemini propose one strange visual seed; translate that seed into the existing `toaster-lab/proposal-transfer/v1` boundary; export one `.toaster-proposal.json` file that Haunted Toaster can admit.

The intended product surface is **Crazy Slots**: a tiny appliance/pedal/patchboard, not a dashboard.

## Required user flow

1. Load **SONG**.
2. Load **ART**.
3. Load or paste **LYRICS**.
4. Normalize lyrics locally and derive whatever timing evidence is honestly available.
5. Adjust a small set of mysterious creative dials/switches if desired.
6. Pull **CRAZY SLOTS** once.
7. Gemini returns exactly **one** creative proposal.
8. Ordinary code validates/translates the result into the existing `toaster-lab/proposal-transfer/v1` export boundary.
9. Download exactly one `.toaster-proposal.json`.
10. Haunted Toaster owns admission, canonical addressing, six-up diversity, mutation, preview, locking, timeline resolution, and final render.

## Non-negotiable architecture

```text
song + art + lyrics
        |
        v
local factual preprocessing
        |
        v
NormalizedInputBundle
        |
        v
Gemini creative proposal
        |
        v
STRICT deterministic translator / validator
        |
        v
toaster-lab/proposal-transfer/v1
        |
        v
Haunted Toaster admission
```

Gemini is sovereign over taste, metaphor, association, and aesthetic weirdness.

Gemini is **not** sovereign over protocol, canonical score addresses, resolved timelines, or Haunted Toaster execution state.

Never use this architecture:

```text
Gemini -> arbitrary final JSON -> download
```

## Interface law

There is no Gemini chat UI.

Gemini never talks to the user. Gemini lives inside the box.

The primary interface should remain extremely small:

- SONG slot
- ART slot
- LYRICS slot
- lyric cleanup/timing status
- a handful of strange but meaningful controls
- one CRAZY SLOTS trigger
- one export/download result

Do not rebuild proposal galleries, breeding, six-up selection, mutation exploration, or a prompt editor in Toast Lab. Those responsibilities belong elsewhere.

## Existing code: preserve the seam, not the museum

The repository currently contains older `GenerationPlan` / `PlanProposal` concepts. Treat them as transitional implementation material, not as product law.

Preserve and reuse anything that proves the Haunted Toaster bridge, especially:

- `toaster-lab/proposal-transfer/v1`
- `toaster-lab/suggested-visual-score/v1`
- the deterministic translation boundary
- existing bridge/transfer tests
- the rule that `suggestedVisualScore.authority === "non-canonical-suggestion"`
- the rule that Haunted Toaster owns validation, canonical addressing, resolution, and execution

It is acceptable to delete, bypass, or radically simplify old UI architecture when it conflicts with the Crazy Slots flow.

## Lyrics law

Lyrics are not merely prompt text. Toast Lab should become the preprocessing boundary that turns messy real-world lyrics into honest structured evidence for Haunted Toaster.

Preferred pipeline:

```text
raw lyrics
  -> normalize Unicode / whitespace / line endings
  -> remove obvious duplicated headings/junk without inventing lyric text
  -> preserve stanza and repeated-line structure
  -> derive rough segmentation/timing from available audio evidence
  -> optional Gemini semantic correction
  -> monotonic cue list
  -> timing provenance/confidence
```

Timing estimates must be marked as estimates. Never fabricate precision.

A future timed lyric cue should be able to distinguish sources such as:

- `provided`
- `derived`
- `estimated`
- `unknown`

No cue may lie outside the known audio duration. Timing must remain monotonic.

## Creative controls

Controls may use strange names, but each must map to real proposal-generation context. Examples:

- Possession
- Foreign Matter
- Rhythmic Obedience
- Image Loyalty
- Topology Rupture
- Material Rot

These controls should influence Gemini's creative request. They should not directly bypass the lawful translator by writing arbitrary Haunted Toaster state.

## Build order

Do not attempt the entire aesthetic application before proving the executable seam.

### Slice 1 — mechanical floor

- three real inputs can be loaded
- a known-good hard-coded proposal can be exported
- the export passes the repository's transfer proof
- Haunted Toaster can ingest it
- no Gemini dependency required

### Slice 2 — Gemini proposal

- replace only creative proposal generation with server-side Gemini structured output
- validate every Gemini response before translation
- one pull produces one proposal
- malformed model output fails visibly and preserves state

### Slice 3 — lyric machine

- deterministic cleanup first
- timing evidence second
- explicit timing provenance/confidence
- fixtures for malformed lyrics, repeated choruses, untimed lyrics, and already-timed lyrics

### Slice 4 — Crazy Slots surface

- reduce the interface to the three equipment slots, small dial/switch bank, trigger, status, and export
- no chat
- no proposal gallery
- no duplicate Haunted Toaster exploration features

## Definition of done for every AI Studio change

Do not report success because TypeScript compiled or the UI rendered.

For any change affecting the main path, run the real vertical slice or its closest automated equivalent:

```text
song -> art -> lyrics -> generate -> validate -> translate -> export
```

At minimum, these must remain green:

```bash
npm run lint
npm run test:bridge
npm run test:transfer
npm run test:product-contract
npm run build
```

If dependencies or environment prevent one of these checks, state exactly which check did not run and why.

## Stop condition

The first successful AI Studio remix is deliberately boring in scope:

> An actual song, artwork, and lyric input can produce one validated downloadable proposal that Haunted Toaster accepts.

Once that works reliably, make the box stranger. Do not expand architecture before this seam is real.
