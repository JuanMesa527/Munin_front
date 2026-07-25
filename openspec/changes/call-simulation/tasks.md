# Tasks: F5 · call-simulation — frontend slice (mirror)

> **This is a mirror.** The canonical task list for this cross-repo change lives in
> `Munin_back/openspec/changes/call-simulation/tasks.md` (full Review Workload Forecast, Phases
> 1–4 backend, Phase 6 cross-repo verification). This file records Phase 5 (frontend) only. If
> the two diverge, the backend copy wins.

## Phase 5 · Frontend (Munin_front)

- [ ] 5.1 `api/call-simulation.api.ts` (`startCall`, `sendCallTurn`, `endCall`).
- [ ] 5.2 `model/use-simulated-call.ts` — state machine
      (`idle→marcando→sonando→en_llamada→colgada→veredicto`).
- [ ] 5.3 `model/use-speech-recognition.ts` (Web Speech API, `soportado` flag) +
      `shared/speech/speech-recognition.d.ts`.
- [ ] 5.4 `model/use-audio-playback.ts`.
- [ ] 5.5 `ui/difficulty-picker.tsx`, `ui/call-overlay.tsx` (built on `shared/ui/modal.tsx`),
      `ui/call-scorecard.tsx` (recharts for `curvaInteres`).
- [ ] 5.6 Wire into `briefing-header.tsx`: button opens picker → overlay; update the file's
      "MOCK" docstring; "Silenciar" mutes Polly audio playback.
- [ ] 5.7 `SIMULACIÓN · NO ES UNA LLAMADA REAL` badge in the overlay.

See the backend copy for Phase 6 (cross-repo `npm run verify` + manual end-to-end).
