# Proposal: F5 · call-simulation — frontend slice (mirror)

> **This is a mirror.** The canonical proposal for this cross-repo change lives in
> `Munin_back/openspec/changes/call-simulation/proposal.md` (intent, full scope, capabilities,
> approach, rollback). This file records the frontend-side trail only. If the two diverge, the
> backend copy wins.

## Intent (short)

The F4 briefing sheet ends at a mock call button (`briefing-header.tsx` docstring: "controles de
llamada son MOCK"). F5 replaces that mock with a voice roleplay against an AI persona built from
the on-screen `BriefingSheet`, and a scorecard on hangup. It is the demo's strongest argument for
the jury: whether the briefing actually makes closing easy becomes measurable.

## Feature slices touched

| Slice | Impact |
|---|---|
| `features/call-simulation/` (new) | Overlay UI, difficulty picker, scorecard, call state machine, speech recognition/playback hooks |
| `features/closer-briefing/ui/briefing-header.tsx` | "Iniciar llamada" opens the difficulty picker instead of only toggling the mock timer; docstring updated |
| `shared/contracts.ts` | Synced copy of backend adenda A11 — do not hand-edit |

## Non-goals (frontend side)

- No telephony, no dialing UI, `revealContact` untouched.
- No persisted call history in the client beyond the current session's React state.
- No blind-mode (briefing-hidden) comparison screen.
