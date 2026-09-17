# Source Coverage Matrix (P0.2)

**Status**: Concept demonstrator. This is the authoritative, current record of what the
resolution-first navigator can and cannot confidently answer, per G-07 of
`docs/RESOLUTION_READY_ACCEPTANCE_MATRIX.md`. It reflects `lib/resolution/sources.ts`'s
lifecycle data exactly — if the two ever disagree, the code is the source of truth and this
document is stale and should be corrected, not the other way around.

## Supported journeys and their approved sources

| Journey | Source ID | Title | Status | Confident-route eligible? |
|---|---|---|---|---|
| `academic_support` | NBCC-SS-002 | Student Success Coaching | `active` | ✅ Yes |
| `academic_support` | NBCC-SS-003 | PASS Guideline | `needs_review` | ❌ No (see below) |
| `financial_support` | NBCC-SS-006 | Student Loans | `active` | ✅ Yes |
| `accessibility` | NBCC-SS-004 | Accessibility and Inclusion Services | `active` | ✅ Yes |
| `wellbeing_safety` | NBCC-SS-005 | Wellness and Counselling | `active` | ✅ Yes |
| `general_student_services` | NBCC-SS-001 | Student Services at NBCC | `active` | ✅ Yes |
| `general_student_services` | NBCC-SS-007 | Contact NBCC | `active` | ✅ Yes (human/contact route) |

**NBCC-SS-003 (`needs_review`)**: a PDF document (`PASS Guideline`), never curated into
`knowledge/curated/` because its extraction path (PDF, not a webpage) was never validated
— see `docs/design-partner-readiness/evidence-inventory.md`. Per G-05, this status is
explicit and deterministic, not a silent gap: `academic_support` queries never rely on
NBCC-SS-003 for a `confident_route` (NBCC-SS-002 alone is sufficient and `active`), and if
a future query is specifically about PASS/Early Alert content only NBCC-SS-003 could
answer, the resolution engine (P0.1) falls back to `human_assisted`, naming Student Success
Coaching as the human contact, rather than guessing from an unreviewed PDF.

All five canonical journeys have at least one `active` approved source today. No journey
is currently blocked from `confident_route` entirely.

## Explicit current gaps (out of coverage)

These service areas are **not** covered by any approved source in
`knowledge/sources.yaml`, and the resolution engine must return `unsupported_query` (with a
General Student Services recovery route) for them — never a confident but wrong route to an
adjacent journey. This is the concrete content behind F-12 and F-13's acceptance
requirements, and the list this document is required to state per G-07:

- **Student ID / campus card replacement** (F-12) — no approved source exists.
- **IT / Wi-Fi / network connectivity issues** (F-13) — no approved source exists. (NBCC's
  IT Service Desk exists as a real service, but no source for it has been added to
  `knowledge/sources.yaml` — adding one is a P0.2-onboarding decision, not something this
  release does implicitly.)
- **Records, transcripts, and enrolment verification** — no approved source exists.
- **Housing / off-campus housing support** — referenced only as a link inside
  NBCC-SS-002's page content, not itself an approved, curated source with its own
  retrieval eligibility.
- **Parking** — no approved source exists.
- **Library services** — referenced only as a link inside curated page content, not an
  approved source in its own right.
- **Admissions / enrolment (applying to a program)** — no approved source exists; this
  product is scoped to *current-student* services, not admissions.

A query about any of the above must resolve to `unsupported_query`, not a confident but
incorrect guess at the nearest existing journey. This is tested directly by F-12 and F-13
in `evals/resolution-acceptance-cases.ts`, and by `tests/resolution-acceptance.test.ts`
(P0.1).

## Source onboarding

See `docs/SOURCE_ONBOARDING.md` for the checklist a new source must pass before it can be
added to `knowledge/sources.yaml` and given lifecycle metadata in
`lib/resolution/sources.ts`.

## Content review / change process

- **Who owns a status change**: the named `owner` field in
  `lib/resolution/sources.ts`'s `LIFECYCLE` record for that source ID. Changing a source's
  status (e.g. `active` → `unavailable` because a page moved) is a one-line code change to
  that record, reviewed like any other code change — not a runtime toggle, so every status
  change is itself a reviewed, auditable commit.
- **`needs_review` sources**: reviewed on the cadence implied by their `reviewDueBy` field.
  A `needs_review` source that passes review (content re-verified, extraction path
  confirmed) is promoted to `active` by updating its lifecycle record and, if applicable,
  curating its content the same way NBCC-SS-001/002/004/005/006 were curated
  (`knowledge/curated/`, following `docs/SOURCE_ONBOARDING.md`).
- **Retirement**: a source whose institutional page has been permanently removed or
  replaced is marked `retired`, not deleted from `knowledge/sources.yaml` — the historical
  record of what was once approved is kept, but `isEligibleForConfidentRoute('retired')`
  guarantees it can never back a confident recommendation again (see
  `tests/resolution-sources.test.ts`, G-03).
