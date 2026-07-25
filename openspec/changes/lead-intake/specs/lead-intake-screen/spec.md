# lead-intake-screen Specification

> **Mirror.** Canonical copy lives in `Munin_back/openspec/changes/lead-intake/specs/`.
> This file mirrors the frontend-relevant capabilities only
> (`lead-intake-screen`, `app-bootstrap-front`). Backend capabilities
> (`lead-intake-conversation`, `-profiling`, `-matching`, `-routing`,
> `-interface`, `app-bootstrap-back`) are specified there — read them for the
> full cross-repo picture.

## Purpose

WhatsApp-style, self-guided chat UI (`LeadIntakeScreen`) consuming F1's
backend turn-by-turn, including consent, quick replies, progress, and honest
degraded states. No business logic in `.tsx` — score/capacity/carril are
backend-decided.

## Requirements

### Requirement: No Business Logic in the UI Layer

`ui/` components MUST be presentational, receiving `score`, `capacidad`, and
`carril` as props from `model/`. Neither `ui/` nor `model/` MAY compute a
score, capacity band, or carril — those values MUST come only from backend
responses via `api/`.

#### Scenario: Screen renders backend-provided carril only

- GIVEN a `ConversationTurn` response with `routing.carril: 'viable'`
- WHEN `LeadIntakeScreen` renders the outcome
- THEN it displays the value from the response, computing nothing locally

### Requirement: Consent-First, Retryable Consent Flow

The first interaction MUST be `ConsentNotice`. Declining MUST NOT close the
chat, unmount the app, or force a reload; the accept action MUST remain
reachable in the same session, and a link to `/politica-de-datos` MUST be shown.

#### Scenario: User declines then accepts later in the same session

- GIVEN the user is shown `ConsentNotice` and declines
- WHEN the user later taps accept without reloading
- THEN the conversation proceeds from the consent step, and the earlier
  decline caused no data to be sent to the backend

### Requirement: Bounded Question UX with Quick Replies

Every question step MUST render `QuickReply[]` as tappable chips AND MUST
allow free-text input. The screen MUST show a progress indicator
(`ProgressBar`) reflecting `ConversationTurn.progreso`.

#### Scenario: Quick reply and free text both available

- GIVEN a `ConversationStep` with `quickReplies.length > 0` and
  `permiteTextoLibre: true`
- WHEN the step renders
- THEN both the quick-reply chips and the free-text input are interactive

### Requirement: Loading, Empty, and Error States Are Mandatory

`LeadIntakeScreen` MUST render distinct loading, empty, and error states
(`Skeleton`, `EmptyState`, `Alert` from `shared/ui`) for every data-fetching
interaction with `api/`.

#### Scenario: Backend unreachable

- GIVEN `api/` receives a network failure
- WHEN the screen re-renders
- THEN an `Alert` error state is shown, never a blank screen

### Requirement: Honest DATA_UNAVAILABLE Presentation, Fixtures Isolated From It

When the backend turn response carries `routing: null` with `carril: null`
(the `DATA_UNAVAILABLE` outcome), the screen MUST show the honest closing
message from the backend, never a fabricated score or `FactorBars`.
`model/lead-intake.fixtures.ts` MUST be used only for local/demo review and
MUST NEVER be substituted for a real `DATA_UNAVAILABLE` response.

#### Scenario: Null-carril turn shows honest closing message

- GIVEN a `ConversationTurn` with `routing: null` and `profile.carril: null`
- WHEN the screen renders the final turn
- THEN it shows the backend's closing message and renders no `ScoreResult`
  or `FactorBars`

#### Scenario: Fixtures never mask a real unavailable response

- GIVEN the app is running against the live backend (not fixture mode)
- WHEN a `DATA_UNAVAILABLE` response arrives
- THEN the screen renders the real degraded state, not fixture data

### Requirement: Copy Discipline — "Estimado", Never "Aprobado"

Any UI copy referencing money, subsidy, or capacity MUST use "estimado" (or
equivalent) and MUST NOT use "aprobado" or imply guaranteed approval. Estrato
MUST NOT be shown as a decision factor.

#### Scenario: Capacity copy uses estimado

- GIVEN a rendered capacity band
- WHEN its label is inspected
- THEN it reads as an estimate, never an approval, and shows no estrato factor

## Non-Requirements (explicit scope boundary)

- The screen MUST NOT navigate to, or build a hook for, F2.1/F2.2 screens;
  it shows the persisted outcome and stops.
