# Source Onboarding Checklist (P0.2)

Follow this checklist before adding a new approved source, or before promoting an existing
`needs_review` source to `active`. Skipping a step is a governance defect, not a shortcut —
per G-06, only sources that pass this process may ever be recommended.

## 1. Approval

- [ ] The source is an official NBCC institutional page or document (public or explicitly
      institution-approved for this purpose) — never scraped, invented, or inferred content
      (`AI_OPERATING_INSTRUCTIONS.md`, operating principle 2).
- [ ] The URL's hostname is on the allowlist in `lib/types.ts`'s `ALLOWED_DOMAINS`
      (`nbcc.ca`, `documents.nbcc.ca`). If the new source lives on a different official
      NBCC hostname, that hostname must be added to `ALLOWED_DOMAINS` first, as its own
      reviewed change — never bypassed.
- [ ] A single named journey from `lib/resolution/types.ts`'s `ResolutionJourney` applies.
      A source that genuinely spans two journeys is either two separate approved-source
      entries (one per journey) or is scoped to `general_student_services` — it is never
      given an invented sixth journey.

## 2. Catalogue entry

- [ ] Add the source to `knowledge/sources.yaml` with `id`, `title`, `url`, `domain`,
      `campuses`, `languages`, `source_type`, `authority: nbcc_public`,
      `retrieved_at`, `time_sensitive`, and `review_status: prototype_public_source` —
      the same schema every existing source uses, validated by `lib/sources.ts`'s
      `validateSource()` and `tests/sources.test.ts`.

## 3. Lifecycle metadata

- [ ] Add a `LIFECYCLE` record for the new source ID in `lib/resolution/sources.ts` with:
      `owner` (a public-facing team name, not a personal contact), `status` (start at
      `needs_review` unless content has already been verified and, where applicable,
      curated — never start a new source at `active` without verification), and
      `lastReviewedAt`.
- [ ] If starting at `needs_review`, set a `reviewDueBy` date.
- [ ] Confirm `loadApprovedSourceMeta()` does not throw (it fails closed if any approved
      source is missing a lifecycle record — this is the safety net that makes skipping
      this step impossible to do silently).

## 4. Content curation (only required for `active` status)

- [ ] Follow the exact process already used for NBCC-SS-001/002/004/005/006
      (`learning-log/DAY_02_D2-01.md`, `learning-log/P0_COVERAGE_UX.md`): live-fetch the
      page, extract its real content (its own content container, not sitewide navigation
      chrome), validate against `lib/curated-sources.ts`'s `validateCuratedSource()`
      (HTTPS, allowlisted domain, minimum content length, valid timestamp), and write to
      `knowledge/curated/<ID>.json`.
- [ ] Do not invent, summarize-from-memory, or paraphrase content — `extracted_text` must
      be the page's real text, honestly captured, including honestly noting when a page's
      real content is thin (see NBCC-SS-006's note in
      `docs/design-partner-readiness/service-resolution-traces.md`).
- [ ] Remove only genuine non-informational UI chrome repeated identically with zero
      distinguishing content (the documented precedent: NBCC-SS-004's repeated "View
      programs" link label, `learning-log/P0_COVERAGE_UX.md`) — never trim or reshape
      content to influence a specific query's outcome.

## 5. Coverage documentation

- [ ] Update `docs/SOURCE_COVERAGE_MATRIX.md`'s table and, if the new source closes a
      previously-listed gap, remove it from the "Explicit current gaps" section.

## 6. Tests

- [ ] Confirm the new source passes every test in `tests/resolution-sources.test.ts`
      (metadata completeness, allowlist membership, journey validity) without modification
      to that test file — a genuinely onboarded source should need no test changes beyond
      the automatic per-source loop already there.
- [ ] If curated, confirm it passes `tests/curated-sources.test.ts`.
- [ ] Run the full acceptance suite (`tests/resolution-acceptance.test.ts`) to confirm no
      existing F/C case regresses — a new active source changes the retrieval corpus and
      can shift confidence margins (see `docs/P0_SPRINT_EXECUTION_PLAN.md`, Risk 1).

## Non-negotiable

Do not add a source merely to make the coverage matrix look more complete. An honest,
documented gap (`docs/SOURCE_COVERAGE_MATRIX.md`) is safer for a student than a source
added without going through every step above.
