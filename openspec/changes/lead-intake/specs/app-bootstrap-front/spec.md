# app-bootstrap-front Specification

> **Mirror.** Canonical copy lives in `Munin_back/openspec/changes/lead-intake/specs/`.

## Purpose

Minimal frontend bootstrap (`main.tsx`, `App.tsx`, providers, router) mounting
only `/` → `LeadIntakeScreen`.

## Requirements

### Requirement: Minimal Router Surface

The router MUST mount only `/` → `LeadIntakeScreen`. It MUST NOT define any
`/closer/*` route or any F2.1/F2.2 route in this change.

#### Scenario: Root renders LeadIntakeScreen on a clean checkout

- GIVEN a fresh checkout with `npm install` and `.env.local` from `.env.example`
- WHEN `npm run dev` is run and `/` is opened
- THEN `LeadIntakeScreen` renders without navigating elsewhere

#### Scenario: No closer routes exist yet

- GIVEN the router configuration as written by this change
- WHEN its route table is inspected
- THEN no `/closer/login`, `/closer`, or `/closer/leads/:leadId` route is present

### Requirement: Required Providers Wired

`App.tsx` MUST wire `QueryClient`, `ErrorBoundary`, and `MotionConfig`
(`reducedMotion: 'user'`) around the router.

#### Scenario: Unhandled render error is caught

- GIVEN a rendering error occurs inside `LeadIntakeScreen`
- WHEN it propagates
- THEN `ErrorBoundary` shows a friendly message, not a blank page or raw stack
