# P0 Decisions Requiring the Product Owner

**Status**: No acceptance ID in `docs/RESOLUTION_READY_ACCEPTANCE_MATRIX.md` or
`evals/resolution-acceptance-cases.ts` was weakened, reinterpreted, deleted, or changed to
make implementation pass. No acceptance ID is marked `BLOCKED` in the final Sprint
Demonstration Pack — every required outcome was implementable as written. This document
therefore does not record a contract change; it records genuine follow-on decisions that
came up during implementation and are the product owner's to make, not this sprint's.

## 1. Should NBCC-SS-003 and NBCC-SS-007 be curated?

**Context**: `NBCC-SS-003` (PASS Guideline, a PDF) is `needs_review` because its extraction
path was never validated — this is real, disclosed, and tested (G-05). `NBCC-SS-007`
(Contact NBCC) is `active` and used directly for its contact information, but has no
curated body text (it doesn't need any — it's a contact page, not informational content
requiring retrieval).

**Options**:
- (a) Leave as-is. Academic support already has a fully working active source
  (NBCC-SS-002); NBCC-SS-003's content is not currently blocking any journey.
- (b) Curate NBCC-SS-003 (would require PDF text extraction, a different code path than
  the existing HTML extraction in `lib/curated-sources.ts`/`lib/sources.ts`).

**Recommendation**: (a) for this release; revisit (b) only if a specific PASS-related
query is found to need it.

## 2. Should a source for Wi-Fi/IT or Student Card services be added?

**Context**: `docs/SOURCE_COVERAGE_MATRIX.md` documents these as explicit, honest gaps.
F-12/F-13 require `unsupported_query` for them today, and that is working correctly.

**Options**:
- (a) Leave unsupported — these areas may not be in scope for this product at all (they
  may belong to IT Service Desk / Registrar's Office workflows outside "student services
  navigation" as currently scoped).
- (b) Onboard a real approved source for one or both, following
  `docs/SOURCE_ONBOARDING.md`, if the product owner decides these belong in scope.

**Recommendation**: This is a scope decision, not an engineering one — the product charter
should say whether IT/records/housing/parking/library are in scope before a source is
added merely because a gap was found.

## 3. Should a real student-validation session be scheduled?

**Context**: `docs/STUDENT_VALIDATION_PROTOCOL.md` is a complete, ready-to-run facilitation
guide. It has not been run with real students — that was never in scope for this
autonomous, repository-contained sprint (running a live session with real people is
explicitly the kind of institutional-policy/people activity this sprint's authority does
not extend to).

**Recommendation**: Schedule a session using the existing protocol before any
design-partner demonstration that claims real-student validation, not before an internal
owner review of the code itself.

## 4. The registry (`lib/resolution/registry.ts`) is a starting point, not a finished taxonomy

**Context**: `PHRASE_REGISTRY`, `GENERIC_TERMS`, and `SAFETY_TERMS` were built and tested
against the 18 F-cases and 7 C-cases in the acceptance contract, plus a modest set of
additional terms judged reasonable during implementation. They are not exhaustively
validated against the full range of real student phrasing (that is precisely what
`docs/STUDENT_VALIDATION_PROTOCOL.md`'s sessions would surface).

**Recommendation**: Treat the registry as versioned and living (per C-06's own
requirement) — expect to add terms after real usage or student-validation findings, each
addition re-verified against the full acceptance suite
(`tests/resolution-acceptance.test.ts`) before being accepted, exactly as
`docs/SOURCE_ONBOARDING.md`'s equivalent process does for sources.

## 5. Automated accessibility tooling

**Context**: No dependency like `axe-core` was added — proportionate to the existing
`@testing-library/react`-based test setup, per the sprint's "no new external dependency
without a genuine need" posture. `tests/resolution-accessibility.test.tsx` covers what
plain RTL assertions can verify; `docs/MANUAL_TEST_SCRIPT.md` covers what needs a human
(screen reader, real device, colour-blindness simulation).

**Recommendation**: If accessibility becomes a recurring release gate (not just a one-time
P0 check), adding a real automated auditor (axe-core or similar) as a reviewed, explicit
dependency addition is a reasonable future investment — not something to add silently
inside this sprint's scope.
