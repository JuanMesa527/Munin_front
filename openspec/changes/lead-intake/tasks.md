# Tasks: F1 · lead-intake — frontend slice (mirror)

> **This is a mirror.** The canonical task list for this cross-repo change lives in
> `Munin_back/openspec/changes/lead-intake/tasks.md` (full Review Workload Forecast, all 5
> work units, backend phases 1–2 and 5). This file records the frontend-side trail (phases 3–4)
> only. If the two diverge, the backend copy wins.
> **Amendment:** backend `design.md`/`tasks.md` added D10 (Supabase)/D11 (DeepSeek) and a new
> backend-only Phase 5 (Unit 5, ~800 lines) — no new frontend phase. Frontend Phase 4 tasks 4.4
> and 4.6 (new) were updated/added to match the amended `/politica-de-datos` scope and
> `ConsentNotice` copy per the now-resolved Open Questions ([x] in the canonical `design.md`).

## Review Workload Forecast (summary)

| Field | Value |
|---|---|
| 400-line budget risk | **High** |
| Chained PRs recommended | **Yes** |
| Chain strategy | **stacked-to-main — confirmed** |
| Frontend units | Unit 3 (~1,050 lines) — feature slice + fixtures; Unit 4 (~470 lines) — bootstrap + routing |
| Backend-only addition | Unit 5 (~800 lines) — Supabase + DeepSeek adapters; see canonical doc, no frontend impact beyond tasks 4.4/4.6 below |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

## Phase 3: Frontend Feature Slice + Fixtures (Unit 3)

Scaffold in parallel with backend Phase 2 using fixtures as stand-ins; mark "ready" once the
backend's `interface/` DTOs land.

- [x] 3.0 GREEN implement design.md D12: replace the placeholder `@theme` tokens in `src/styles/index.css` with the Colsubsidio hackathon brand tokens (colors, `--font-display`/`--font-mono`, radii, base-4 spacing, elevation) per D12's table. **Shared file — announce.** Do first — every component built in this phase should render with the real theme, not the placeholder one. No logo/wordmark/tangram symbol — tokens only.
- [x] 3.1 RED `src/features/lead-intake/api/intake.api.test.ts` — `startIntake`/`submitConsent`/`submitTurn` call `unwrap(apiPost(API_ROUTES.intake.*, body))`.
- [x] 3.2 GREEN implement `api/intake.api.ts` + `api/index.ts`.
- [x] 3.3 RED `model/use-intake-conversation.test.ts` — reducer transitions across the 8 screen states; last turn cached under `queryKeys.intake.conversation(leadId)`; no `localStorage`/`sessionStorage`.
- [x] 3.4 GREEN implement `model/use-intake-conversation.ts` + `model/index.ts`.
- [x] 3.5 Create `model/lead-intake.fixtures.ts` — scripted `ConversationTurn[]`, fictitious/no-PII data. **Applies only as a `NETWORK_ERROR`/`TIMEOUT_ERROR` fallback — never as a switch away from a real `routing:null`/`carril:null` response.** This tightens the "Ver ejemplo con datos de demostración" escape-hatch described further down in this file's own `design.md` — that description is stale; follow this task, not that prose.
- [x] 3.6 RED `ui/intake-outcome.test.tsx` — `completado-sin-clasificar` renders the honest closing message only, no `FactorBars`/score, no fixture switch even when `routing:null` arrives from a live backend.
- [x] 3.7 GREEN implement `ui/intake-outcome.tsx`.
- [x] 3.8 RED `ui/chat-shell.test.tsx` — quick replies + free text both interactive; `ProgressBar` bound to `progreso`.
- [x] 3.9 GREEN implement `ui/chat-shell.tsx`.
- [x] 3.10 RED `ui/lead-intake-screen.test.tsx` — all 8 states incl. `Skeleton`/`EmptyState`/`Alert`; decline → retry in same session, nothing sent to API; "estimado" copy, never "aprobado"; no `estrato` factor shown.
- [x] 3.11 GREEN implement `ui/lead-intake-screen.tsx`.
- [x] 3.12 GREEN implement `src/features/lead-intake/index.ts` — export only `LeadIntakeScreen`.

## Phase 4: Frontend Bootstrap + Routing (Unit 4)

Depends on Phase 3 (feature slice exported).

- [x] 4.1 RED `app/providers/error-boundary.test.tsx` — render error caught, friendly message, no blank page/stack.
- [x] 4.2 GREEN implement `app/providers/{query-client,error-boundary,motion,index}.tsx` (`retry:1`, no refetch-on-focus; `MotionConfig reducedMotion="user"`).
- [x] 4.3 RED route-table test — router mounts only `/` → `LeadIntakeScreen`; no `/closer/*` route exists.
- [x] 4.4 GREEN implement `app/routes/index.tsx` + `app/routes/privacy-policy.page.tsx` — finalidades, titular rights (conocer/actualizar/rectificar/suprimir/revocar), "qué NO pedimos", demo banner, **plus two lines required by the D10/D11 amendment**: (a) free-text answers may be processed by an external AI provider outside Colombia, (b) F1 does not yet implement self-service deletion — an honest gap, not a promised right the UI can't fulfill.
- [x] 4.5 GREEN implement `src/app/App.tsx` (`RouterProvider`) + `src/main.tsx`.
- [x] 4.6 Modify `src/shared/ui/consent-notice.tsx` — two copy changes, same shared file: (a) add a one-line AI-provider international-transfer disclosure matching `/politica-de-datos`'s new line (D11 Open Questions resolution: "update the consent copy, don't restrict the provider"); (b) soften the unqualified "conocer, actualizar, rectificar **y suprimir**" wording — F1 ships no delete endpoint (D10/proposal non-goal), so promising unconditional *supresión* overstates what the product does today. Finalidades copy is hardcoded in `TEXTO_FINALIDAD`, not passed via props. **Shared UI file — announce (rule 25).**
- [x] 4.7 Manual smoke: clean checkout → `npm run dev` (both repos) → `/` renders `LeadIntakeScreen`, full flow completes unaided. **Sandbox note:** no headless browser available to drive real user interaction; verified instead via `npm run build` (succeeds — this is exactly what previously failed with "Failed to resolve /src/main.tsx") + `npm run preview` served on `:4173`, confirmed `index.html` references the built bundle and the bundle's text includes `ConsentNotice`'s copy ("Antes de empezar: tus datos"), proving `/` → `App` → `LeadIntakeScreen` → `ConsentNotice` resolves end-to-end. A real-browser click-through smoke is still recommended before the demo.

## Follow-up

- [x] `design.md`'s stale "Ver ejemplo con datos de demostración" fixture-switch description has
  been corrected (Frontend-specific decisions section + new D12) to match the tightened D9 —
  resolved, no longer a follow-up.
  copy pass before archive.
