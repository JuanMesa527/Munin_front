# Proposal: F1 · lead-intake — frontend slice (mirror)

> **This is a mirror.** The canonical proposal for this cross-repo change lives in
> `Munin_back/openspec/changes/lead-intake/proposal.md` (intent, full scope, capabilities,
> risks, rollback). This file records the frontend-side trail only. If the two diverge,
> the backend copy wins.

## Intent (short)

F1 is the first screen a judge touches and carries **15% UX + the visible half of 30% perfilamiento** of the rubric. The chat must be self-guided end to end: consent → ≤5–6 questions → outcome with its explanation. Today no `src/app/`, no `src/main.tsx` and no feature slice exist on disk, so nothing renders.

## Feature slices touched

| Slice | Impact |
|---|---|
| **F1 `lead-intake`** | New — `src/features/lead-intake/{ui,model,api}/` + `index.ts` → `LeadIntakeScreen` |
| **`app/`** (cross-cutting — **announce to team**) | New — `src/main.tsx`, `src/app/App.tsx`, `app/providers/` (QueryClient, ErrorBoundary, MotionConfig), router with only `/` → `LeadIntakeScreen` |
| `shared/ui` | **Unchanged** — consume `ConsentNotice`, `ChatBubble`, `QuickReplies`, `ProgressBar`, `TypingIndicator`, `FactorBars`, `Field` as-is. Any missing primitive is a `// PROPUESTA AL EQUIPO:`, not a silent addition |
| `shared/contracts.ts` | **Unchanged** — synced from `Munin_back`. A missing field is proposed upstream, never edited here |

## In Scope

- `LeadIntakeScreen`: WhatsApp-look chat (presentation only, zero WhatsApp deps), consent as the first blocking step, quick replies + free text, `ProgressBar` bound to `ConversationTurn.progreso`, `FactorBars` for `ScoreResult.factores`, final viable / no-viable outcome screen.
- `api/` calling `API_ROUTES.intake.{start,turn,consent}` through `apiGet`/`apiPost`/`unwrap`; `queryKeys.intake` for cache keys. `ui/` never calls `fetch`.
- Loading / empty / error states on every data-fetching state (`Skeleton`, `EmptyState`, `Alert`); `ApiResponse.ok === false` handled explicitly.
- `model/lead-intake.fixtures.ts` — fictional demo dataset so the screen is reviewable while the backend data catalog is uncalibrated. Dev/demo only; it must not hide the backend's real `DATA_UNAVAILABLE` behavior.

## Out of Scope

- Navigating to or triggering **F2.1 / F2.2** — F1 shows the outcome and stops. No carril switch, no extension point; `client-flow.page.tsx` is not built here.
- `/closer/*` routes, `CloserGuard` wiring, F3/F4 screens.
- `/politica-de-datos` page content beyond the `RUTA_POLITICA` link already exposed by `ConsentNotice`.
- Any edit to `shared/contracts.ts` or `shared/ui`.

## Frontend hard constraints

- No business logic in `.tsx`: score, capacity and `carril` come from the backend (glass-box).
- Amounts arrive as normalized integer COP — only `formatCOP`/`formatCOPCompact`, never `*1000` or `/1000`.
- No `estrato` shown as a decision factor. Copy says **"estimado"**, never "aprobado".
- No lead or session data in `localStorage`/`sessionStorage`. No third-party analytics or external CDN.
- No `any`, no `@ts-ignore`, no `dangerouslySetInnerHTML`. Tokens from `@theme`, AA accessibility, `prefers-reduced-motion` respected.
- Fictional names only; phones always masked via `maskPhone`.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Backend not running / uncalibrated data → blank screen | High | Fixtures + explicit error and degraded states; never a fabricated score |
| `app/` bootstrap collides with the `shared/ui + app/` owner | Medium | Announce before merge; keep routing minimal (only `/`) |
| 400-line review budget across slice + bootstrap | Medium | Chain PRs: (1) slice + fixtures + tests, (2) bootstrap + routing |
| Contract gap discovered mid-build | Medium | Propose in `Munin_back`, run `contracts:sync` there, announce — never edit locally |

## Rollback Plan

All files are new. Revert = drop the feature branch; `src/shared/**` is untouched, so no `contracts:sync` or design-system rollback is needed. The app returns to its current state (no bootstrap, nothing rendered).

## Success Criteria

- [ ] Someone who did not build it completes the flow with no verbal guidance.
- [ ] Consent blocks the chat until accepted; declining leads to a clear, non-broken state.
- [ ] Any score shown is accompanied by its `factores`.
- [ ] Screen works on mobile, in dark mode, and with keyboard-only navigation.
- [ ] `npm run verify` passes (typecheck + lint + test + build).
