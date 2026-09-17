# P0 Autonomous Sprint — Execution Plan

**Status**: Concept demonstrator. This plan governs the combined P0 release described in
`docs/RESOLUTION_READY_ACCEPTANCE_MATRIX.md` (the release contract) and
`evals/resolution-acceptance-cases.ts` (its executable fixture). Both files were copied
byte-for-byte from `origin/docs/p0-resolution-ready-acceptance` @
`6f2a1b5d04057be8d99616db03355f986764da78` and are not modified by this plan or any branch
under it.

## Architecture summary (as inherited from `main` @ `31d81320d2e3b8e7897016da82b07a8241ff3af8`)

- `lib/curated-sources.ts` — loads `knowledge/curated/*.json` (5 active sources today:
  NBCC-SS-001/002/004/005/006).
- `lib/retrieval.ts` — deterministic keyword scoring (`searchCuratedSources()`), with
  title/domain/body weighting and a document-frequency exclusive-term multiplier.
- `lib/routing.ts` — maps a matched source's `domain` to one of five *legacy* journeys
  (`academic_support`, `financial_support`, `accessibility_inclusion`, `wellbeing_safety`,
  `general_contact`).
- `lib/escalation.ts` — 6 policy-driven escalation triggers, evaluated in priority order;
  `crisis_or_safety` and `accommodation_request` are hardcoded-safe (target independent of
  journey); `personalized_decision` was hardened in P0 (previous increment) to hardcode
  financial-decision phrasing to the named financial contact.
- `lib/navigate.ts` + `app/api/navigate/route.ts` — wraps the above into a plain-language,
  learner-safe response, used by the current single-search homepage (`app/page.tsx`).

**This existing pipeline is not the resolution-first contract.** Its journey names
(`accessibility_inclusion`, `general_contact`) and its escalation-trigger vocabulary do not
match the acceptance contract's `ResolutionState` vocabulary
(`confident_route`/`guided_choice`/`human_assisted`/`unsupported_query`/`safety_escalation`)
or its journey vocabulary (`accessibility`, `general_student_services`). It is left in
place, unmodified and still working, and is **not** removed or renamed — the new resolution
engine is additive, reusing the same curated content and scoring primitives rather than
duplicating them, and the homepage is replaced (per the sprint brief's explicit
requirement) by P0.1's dual-entry UI.

## Reusable work identified (do not rebuild)

- `feat/d5-d7-service-resolution-readiness` and `feat/p0-five-journey-ux` are both already
  merged into `main`. Their outputs — 5 curated active sources, the crisis/safety keyword
  list in `lib/escalation.ts`, the hardened financial-decision-target pattern, and
  `lib/retrieval.ts`'s scoring primitives — are the foundation this sprint builds on, not
  something to reproduce.
- `lib/curated-sources.ts::loadAllCuratedSources()` is reused directly for source content.
- `lib/retrieval.ts::searchCuratedSources()`'s scoring model is reused (not reimplemented)
  as the underlying evidence signal for the new confidence gate.
- `lib/escalation.ts`'s `CRISIS_SAFETY_TERMS` list is the starting point for the new,
  separately-governed `SAFETY_TERMS` registry (kept as its own reviewed list per the
  contract's requirement that phrase/synonym/typo mappings carry their own metadata and
  tests — not silently shared with the legacy escalation module, so each can evolve
  independently without one governance change accidentally affecting the other).

## Workstream ownership and shared-file rules

| Branch | Owns (new files) | Touches (shared, coordinate) | Base |
|---|---|---|---|
| `feat/p0-foundation-resolution-ready` | `lib/resolution/types.ts`, contract docs (copied) | none | `main` |
| `feat/p0.2-content-lifecycle-quality` | `lib/resolution/sources.ts`, `docs/SOURCE_COVERAGE_MATRIX.md`, `docs/SOURCE_ONBOARDING.md`, `tests/resolution-sources.test.ts` | none (no UI, no engine) | foundation |
| `feat/p0.1-resolution-first-navigation` | `lib/resolution/registry.ts`, `lib/resolution/engine.ts`, `app/page.tsx` (replaced), `app/globals.css` (extended), `app/api/resolve/route.ts`, `tests/resolution-engine.test.ts`, `tests/resolution-acceptance.test.ts`, `tests/resolution-page.test.tsx` | `lib/resolution/sources.ts` (reads P0.2's contract, does not edit it — see rebase note below) | foundation |
| `feat/p0.3-accessibility-student-validation` | `docs/ACCESSIBILITY_BASELINE.md`, `docs/MANUAL_TEST_SCRIPT.md`, `docs/STUDENT_VALIDATION_PROTOCOL.md`, small scoped a11y fixes in `app/page.tsx`/`app/globals.css` | `app/page.tsx`, `app/globals.css` (P0.1's files — branched from P0.1's tip, not foundation, specifically to avoid editing a file neither branch has seen) | **P0.1** (not foundation) |

**Dependency order and rationale**: P0.2 depends only on the foundation's types (it defines
the source-status/eligibility contract independently of the engine). P0.1 depends on the
foundation's types and reads P0.2's source contract (P0.1 is branched from foundation, and
because P0.2 does not touch any file P0.1 owns, P0.1 can cherry-pick P0.2's
`lib/resolution/sources.ts` addition once P0.2 exists, without waiting for a merge to
`main` — this is the "exact rebase/merge instructions" the brief requires, spelled out
below). P0.3 is branched from **P0.1's tip**, not the foundation, specifically because its
job is to audit and narrowly fix P0.1's actual UI — branching from foundation would leave
P0.3 unable to see the UI it is meant to validate, and would create a large, unreviewable
merge conflict later. This is a deliberate, documented deviation from a strict
foundation-only branch topology, chosen because the alternative (P0.3 blind to the UI it
audits) is worse for the product objective this sprint serves.

**Exact rebase/merge instructions** (since the foundation and P0.2 are not merged to `main`
before P0.1/P0.3 start):
1. `feat/p0.1-resolution-first-navigation` is created from
   `feat/p0-foundation-resolution-ready`'s tip, then cherry-picks
   `feat/p0.2-content-lifecycle-quality`'s single commit that adds
   `lib/resolution/sources.ts` (the only file P0.1 depends on from P0.2). No other P0.2
   file is touched by P0.1.
2. `feat/p0.3-accessibility-student-validation` is created from
   `feat/p0.1-resolution-first-navigation`'s tip directly (already includes foundation +
   the cherry-picked P0.2 commit).
3. When the owner merges to `main` in the documented order (foundation → P0.2 → P0.1 →
   P0.3), the cherry-picked commit in P0.1 will collide with P0.2's own copy on merge;
   this is a standard identical-patch merge (git recognizes the same diff) and is called
   out here explicitly rather than left implicit, per the brief's requirement.

## Test commands

```
npm ci
npx tsc --noEmit                 # typecheck (no dedicated script exists in package.json;
                                  # see Known Limitations — ESLint is not configured and
                                  # was not added, to avoid introducing an unreviewed
                                  # dependency non-interactively)
npm test                         # jest --coverage, includes acceptance-case tests
npm run build                    # production build + route inventory
NODE_ENV=production npm start    # + curl checks for /dev/* 404 and /api/health 200
```

## Risks

1. **Corpus-scaling / generic-term fragility** (carried forward from `learning-log/DAY_04.md`
   and `learning-log/P0_COVERAGE_UX.md`): the confidence gate's thresholds are calibrated
   against the current 5-source corpus and the 18 F-cases + 7 C-cases; adding a 6th active
   source without re-running the full acceptance suite could silently shift a margin.
   Mitigation: thresholds are named constants in `lib/resolution/registry.ts` with a code
   comment pointing at this risk, and `tests/resolution-acceptance.test.ts` runs the full
   contract fixture on every change.
2. **Multi-intent detection (F-15) is inherently a judgment call** for a keyword system: a
   query mentioning two journeys' meaningful terms must not silently pick one. Mitigation:
   the engine counts distinct journeys with at least one meaningful-term hit and forces
   `guided_choice` whenever that count is ≥ 2, before any threshold/margin check runs.
3. **P0.3 branching from P0.1 instead of the foundation** (see above) means P0.3's diff
   will include all of P0.1's commits until P0.1 merges — this is expected and is not a
   merge conflict; the final integration verifier confirms this explicitly.

## Rollback plan

Every branch is a draft PR against `main`, none merged. Rollback is simply not merging.
If a defect is found post-review in one branch, only that branch's draft PR needs
correction — the others do not depend on its being merged (only on its being *based on*,
per the ownership table above), so no cross-branch rollback is required.

## Acceptance criteria mapping

See the final Sprint Demonstration Pack (delivered as this session's closing report) for
the full ID-by-ID mapping. This plan's role is to fix *where* each requirement is
implemented before implementation starts:

- `ResolutionState`, `SourceStatus`, `ResolutionResult`, safety-first precedence rule →
  foundation (`lib/resolution/types.ts`).
- F-01–F-18, C-01–C-07 → P0.1 (`lib/resolution/engine.ts`, `lib/resolution/registry.ts`,
  `app/page.tsx`, `tests/resolution-acceptance.test.ts`).
- G-01–G-08 → P0.2 (`lib/resolution/sources.ts`, `docs/SOURCE_COVERAGE_MATRIX.md`,
  `docs/SOURCE_ONBOARDING.md`, `tests/resolution-sources.test.ts`).
- A-01–A-10 → P0.3 (`docs/ACCESSIBILITY_BASELINE.md`, `docs/MANUAL_TEST_SCRIPT.md`, scoped
  fixes in `app/page.tsx`/`app/globals.css`).
- V-01–V-05 → P0.3 (`docs/STUDENT_VALIDATION_PROTOCOL.md`).

## Execution model note

This sprint was executed by a single lead session using sequential, isolated `git
worktree` checkouts per branch (not concurrent subagent processes), specifically because
the shared-contract nature of this work (one confidence gate, one set of 18 interdependent
acceptance cases) carries higher correctness risk under concurrent editing than the
efficiency gain of parallelism would justify at this scope. Each branch was fully
committed, tested, and pushed before the next began, so no two branches were ever edited
concurrently — satisfying the "no concurrent edits to the same files" rule by construction.
An independent reviewer pass was performed by a separate, freshly-started review agent
with read-only intent against the finished branches (not the same context that wrote the
implementation), per the brief's requirement that the implementer not be the sole judge of
its own work.
