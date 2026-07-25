# call-simulation-overlay Specification

## Purpose

The closer-facing call UI: difficulty selection, live transcript with speech input/playback, and
the post-call scorecard. Presentational + state-machine layer only — score, outcome and coverage
are computed by the backend (`call-simulation-verdict`), never in `.tsx`.

## Requirements

### Requirement: Microphone Failure Never Blocks the Call

The call overlay MUST show a visible text input alongside the microphone control at all times,
not only after a recognition failure. If `use-speech-recognition`'s `soportado` is `false`, or
the browser denies microphone permission, the closer MUST still be able to complete the call by
typing.

#### Scenario: Unsupported browser falls back to text without breaking the flow

- GIVEN `window.webkitSpeechRecognition` is `undefined` (e.g. Firefox)
- WHEN the call overlay mounts
- THEN `use-speech-recognition` reports `soportado: false` and the overlay's text input is
  usable to send turns, with no error state blocking the call

### Requirement: Audio Playback Failure Falls Back to Text Display

When a `CallTurn.audio` is `null` (speech synthesis unavailable or `SPEECH_PROVIDER=none`), the
overlay MUST still render `leadRespondio` as visible transcript text. It MUST NOT show an error
or a broken-audio state for a `null` audio field — this is an expected, first-class case.

#### Scenario: Text-only turn renders cleanly

- GIVEN a `CallTurn` with `audio: null`
- WHEN the overlay renders that turn
- THEN the lead's reply text appears in the transcript and no audio player error is shown

### Requirement: Simulation Is Clearly Labeled as Non-Real

The call overlay MUST display a persistent, visible badge or label stating this is a simulation
and not a real call (e.g. "SIMULACIÓN · NO ES UNA LLAMADA REAL"), for the duration the overlay is
open.

#### Scenario: Badge is present throughout the call

- GIVEN the call overlay is open, in any state (`sonando`, `en_llamada`, `colgada`)
- WHEN the DOM is inspected
- THEN the simulation badge text is present and visible

### Requirement: Scorecard Never Fabricates Outcome Data Client-Side

`ui/call-scorecard.tsx` MUST render `CallOutcome`, `puntaje`, and coverage arrays exactly as
returned by `POST .../call/end`. It MUST NOT compute or override any of these values in the
frontend — that would violate the glass-box guarantee the backend's `call-simulation-verdict`
capability provides.

#### Scenario: Scorecard is a pure render of the backend response

- GIVEN an `endCall` response with `outcome: 'no_cierra'` and `puntaje: 34`
- WHEN `call-scorecard.tsx` renders that data
- THEN the displayed outcome and score match the response exactly, with no client-side
  recalculation

### Requirement: Call State Machine Has No Illegal Transitions

`use-simulated-call.ts` MUST enforce the sequence
`idle → marcando → sonando → en_llamada → colgada → veredicto`, with no direct transition from
`idle` to `en_llamada` or from `en_llamada` back to `marcando`.

#### Scenario: Hanging up before connecting is a valid short-circuit, not a broken state

- GIVEN the state is `sonando` (ringing, before the first turn resolves)
- WHEN the closer hangs up
- THEN the state transitions to `colgada` directly, and no `CallTurn` beyond the opening is sent
