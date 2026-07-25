# Design: F1 · lead-intake — frontend slice (mirror)

> **This is a mirror.** The canonical design for this cross-repo change lives in
> `Munin_back/openspec/changes/lead-intake/design.md` (full architecture decisions, backend
> layering, data flow, threat matrix, testing strategy). This file records the frontend-side
> trail only. If the two diverge, the backend copy wins.

> **Backend amendment D10/D11 — no frontend impact.** The backend added a Supabase `LeadRepository` adapter and a
> DeepSeek `LlmPort` provider, both selected by env vars behind existing ports. The frontend still talks **only** to the
> backend HTTP API via `API_ROUTES`, never to Supabase and never to any LLM provider directly; `contracts.ts`,
> `ConversationTurn` and every screen state below are unchanged. No `VITE_*` variable is added — a Supabase or DeepSeek
> key in this repo would be a leaked key (rule 16). This note exists so the silence is explicit.

## Approach (short)

Feature-Sliced slice with a strict one-way flow `ui/ → model/ → api/ → @shared/api`. `ui/` never
calls `fetch`, never computes score, capacity or carril: it renders what `ConversationTurn`
carries. `contracts.ts` and `shared/ui` are **unchanged** — any missing primitive is a
`// PROPUESTA AL EQUIPO:` comment, never a silent addition.

## Files

| File | Action | Layer | Description |
|---|---|---|---|
| `src/features/lead-intake/api/intake.api.ts` | Create | api | `startIntake`, `submitConsent`, `submitTurn` — all `unwrap(apiPost<ConversationTurn>(API_ROUTES.intake.*, body))` |
| `src/features/lead-intake/api/index.ts` | Create | api | internal barrel |
| `src/features/lead-intake/model/use-intake-conversation.ts` | Create | model | `useReducer` (messages + last turn + phase) + 3 `useMutation`; last turn cached under `queryKeys.intake.conversation(leadId)`. No `localStorage`/`sessionStorage` |
| `src/features/lead-intake/model/lead-intake.fixtures.ts` | Create | model | scripted `ConversationTurn[]`, fictitious data, zero PII |
| `src/features/lead-intake/model/index.ts` | Create | model | internal barrel |
| `src/features/lead-intake/ui/lead-intake-screen.tsx` | Create | ui | hosts the state machine below |
| `src/features/lead-intake/ui/chat-shell.tsx` | Create | ui | header + `ChatBubble` list + `TypingIndicator` + `QuickReplies` + free-text `Field` |
| `src/features/lead-intake/ui/intake-outcome.tsx` | Create | ui | three terminal states + `FactorBars` when `score !== null` |
| `src/features/lead-intake/index.ts` | Create | public | `export { LeadIntakeScreen }` — the only exported symbol |
| `src/main.tsx`, `src/app/App.tsx` | Create | app | **Cross-cutting — announce.** `RouterProvider` (react-router 8) |
| `src/app/providers/{query-client,error-boundary,motion,index}.tsx` | Create | app | **Announce.** QueryClient (`retry: 1`, no refetch-on-focus), ErrorBoundary, `MotionConfig reducedMotion="user"` |
| `src/app/routes/{index.tsx,privacy-policy.page.tsx}` | Create | app | **Announce.** `/` → `LeadIntakeScreen`; `/politica-de-datos` → minimal placeholder incl. AI-disclosure + no-deletion-yet lines (D12). **No `/closer/*`** |
| `src/styles/index.css` | Modify | shared | **Announce.** Replace placeholder `@theme` tokens with D12's Colsubsidio hackathon brand tokens |
| `src/shared/ui/consent-notice.tsx` | Modify | shared | **Announce.** One-line finalidades copy update: disclose external AI processing, soften unconditional "suprimir" wording |

## Screen states (all driven by `ConversationTurn` — no local business logic)

| State | Predicate | Renders |
|---|---|---|
| `cargando` | start mutation pending | `Skeleton` + `TypingIndicator` |
| `consent-pendiente` | `profile.consentimiento === null` | `ConsentNotice` only — everything else gated |
| `consent-rechazado` | user declined | respectful terminal card, `RUTA_POLITICA` link, in-session retry; **nothing sent to the API, nothing persisted** |
| `conversando` | `siguientePaso !== null` | chat bubbles + `QuickReplies` + `Field` + `ProgressBar value={progreso}` |
| `completado-viable` | `siguientePaso === null && routing?.carril === 'viable'` | `explicacion` + `ProjectMatch.razon` + `FactorBars factores={score.factores} weightsVersion` |
| `completado-no-viable` | `… routing?.carril === 'no_viable'` | `explicacion` + `razones`, "todavía no" tone, `FactorBars` |
| `completado-sin-clasificar` | `siguientePaso === null && routing === null` | honest closing message, **no score, no gauge, no fabricated carril** |
| `error` | `ApiRequestError` | `Alert` with the backend `message`; fixture offer only on network/timeout |

Terminal state is `siguientePaso === null`; the three outcomes are told apart by `routing`
(`RoutingDecision.carril` is non-nullable, so `carril: null` is encoded as `routing: null` —
see backend design D3). No `contracts.ts` change is required.

## Frontend-specific decisions

**Fixtures never mask `DATA_UNAVAILABLE`** (D9, tightened after product review — this paragraph
previously described a manual demo-switch escape hatch; that language is stale, ignore any
earlier copy that mentions it). Fixtures cover **only** an unreachable/timed-out backend
(`NETWORK_ERROR`, `TIMEOUT_ERROR`). On a real `carril: null` the screen shows **only** the honest
unclassified closing message — no score, no gauge, and **no fixture switch of any kind**, labelled
or not. The fixture fallback exists purely so the UI is demoable when the backend can't be reached
at all; it must never appear as an option once the backend has actually answered with
`carril: null`.

**Conversation state is local.** No login, no cross-screen persistence, no storage APIs for lead
data → a single `useReducer` inside `model/` plus three mutations. TanStack Query is used for the
mutation lifecycle and one cache entry (`queryKeys.intake.conversation(leadId)`), not as a store.

**`/politica-de-datos` is in scope as a minimal page** — finalidades, titular rights
(conocer/actualizar/rectificar/suprimir/revocar), the "qué NO te pedimos" block, an explicit line
disclosing that free-text answers may be processed by an external AI provider outside Colombia
(required now that `LLM_PROVIDER=deepseek` exists — backend D11), an explicit line stating plainly
that self-service deletion is **not yet implemented** (honest gap, not a promised right the UI
can't fulfill — backend D10 / proposal non-goals), and a visible "esto es una demo, no es un aviso
legal vigente de Colsubsidio" banner. Without it the consent is not *informed* and
`ConsentNotice`'s link 404s. Full legal privacy-policy text stays **out of scope** (proposal
non-goals). `ConsentNotice`'s own finalidades copy (`shared/ui/consent-notice.tsx`) needs the same
one-line AI-disclosure addition — it currently promises "suprimir" unconditionally, which now
overstates what F1 can do; soften that line to match.

### D12 — Design system tokens sourced from the hackathon's shared brand reference

Product owner supplied `Munin_front/Design System Colsubsidio.html` (a bundled export, verified
live in-browser, not statically parsed — it's a compressed JS bundle) and confirmed: **tokens yes,
example screens no** (the file's own footer says it was built for the "Crédito hiperpersonalizado"
reto, not Vivienda — its credit-simulator screens don't apply here, but the color/type/spacing
system is hackathon-brand-level, not reto-specific).

Applied to `src/styles/index.css`'s Tailwind v4 `@theme` block (replacing whatever placeholder
tokens are there now) and consumed by `shared/ui` primitives — this is a **shared-file change,
announce it** like any other `shared/ui`/`styles` edit:

| Token | Value | Use |
|---|---|---|
| `--color-brand-primary` | `#F2CE1B` | primary actions (buttons, active states) |
| `--color-brand-vivid` | `#F5D400` | decorative blobs/accents only, not text |
| `--color-brand-amber` | `#E0B000` | hover state for primary |
| `--color-ink` | `#0D0D0D` | primary text |
| `--color-accent-blue` | `#1E5AA8` | sparing accent — links, info state, wordmark |
| `--color-gray-800` | `#3A382F` | secondary text |
| `--color-gray-500` | `#8A867A` | muted/placeholder text |
| `--color-gray-300` | `#CFCABB` | borders/dividers |
| `--color-gray-100` | `#EEEBE0` | subtle surfaces |
| `--color-cream` | `#FBF9F2` | app background |
| `--color-success` | `#2E9E4F` | semantic success |
| `--color-warning` | `#E0B000` | semantic warning |
| `--color-error` | `#D64545` | semantic error |
| `--color-info` | `#1E5AA8` | semantic info |
| `--color-tint-yellow` | `#FCF3C7` | success/highlight background tint |
| `--color-tint-blue` | `#DDE8F5` | info background tint |
| `--color-tint-success` | `#DCEEDF` | success background tint |
| `--font-display` | `"Space Grotesk", sans-serif` | headings, figures (money/scores), body text |
| `--font-mono` | `"JetBrains Mono", monospace` | labels, nav, technical/audit-style data (e.g. `weightsVersion`, timestamps) |
| `--radius-sm` \| `--radius-md` \| `--radius-lg` \| `--radius-full` | `8px` \| `12px` \| `18px` \| `999px` | buttons use `full` (pill, confirmed live: primary button renders at `border-radius: 999px`) |
| `--space-*` | `4 · 8 · 16 · 24 · 40 · 64` px | base-4 spacing scale |
| `--shadow-sm` \| `--shadow-md` \| `--shadow-lg` | reasonable escalating values (exact shadow tokens weren't recoverable from the live bundle inspection — pick sensible defaults, e.g. `0 1px 2px rgba(13,13,13,.06)` / `0 4px 12px rgba(13,13,13,.08)` / `0 12px 32px rgba(13,13,13,.12)`, and say so in a one-line comment) | card elevation |

**No green**, per the source file's own explicit rule ("nada de verde") — don't introduce a green
anywhere, including for a future success state beyond `--color-success`/`--color-tint-success`
above (those are the only sanctioned greens and already fixed).

Primary button reference (measured live): background `#F2CE1B`, text `#0D0D0D`, `font-weight: 700`,
`border-radius: 999px`, `padding: 13px 26px`, `font-family: "Space Grotesk"`, `font-size: 15px`.

**Not applied**: any logo, wordmark, or "tangram" symbol from the source file — the file's own
footer says to replace these before production, and EQUIPO.md already forbids using Colsubsidio's
real identity as if this were an approved Colsubsidio product. Only color/type/spacing/radius
tokens and generic component *patterns* (button/field/tag shapes) are adopted, never brand marks.

**Copy rule:** every money/capacity/subsidy string says "estimado", never "aprobado"; `estrato` is
never shown as a decision factor.

## Testing

| Layer | What | Approach |
|---|---|---|
| Unit | reducer transitions, the 8 screen states, "estimado" copy, `FactorBars` never rendered without `factores`, fixtures never auto-replace `carril: null` | vitest + happy-dom + Testing Library |
| Build | `npm run verify` (typecheck + lint + test + build) | before every PR |

## Delivery

Frontend slices of the chained-PR plan: **(3)** front slice + fixtures, **(4)** front bootstrap +
routing. Rollback = drop the branch; all files are new and `contracts.ts` is untouched.
