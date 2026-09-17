# P0 — Five-Journey Coverage and Learner Service-Resolution UX

**Status**: Concept demonstrator. Branch `feat/p0-five-journey-ux`, base `main` @
`e1f2f7f952b120efa0880afe91bbcae914cb6aa9` (verified exact match to the required baseline
at preflight; no intervening commits on `origin/main`). Not merged.

## Purpose

Close the accessibility/financial content-coverage gap disclosed in Days 5–7
(`docs/design-partner-readiness/service-resolution-traces.md`, `D-FUTURE-01`), harden the
one non-hardcoded escalation target found in that disclosure, and replace the Day 1
concept-shell homepage with a working learner UI over the real deterministic pipeline.

## Preflight

- `git fetch origin`, `git switch main`, `git pull --ff-only origin main` — confirmed
  `main` at `e1f2f7f952b120efa0880afe91bbcae914cb6aa9`, matching the required baseline
  exactly (no later commits to inspect).
- `git branch -r` confirmed no conflicting open PRs against the files this increment
  touches; `docs/adr-value-led-hybrid-ai` and `research/canadian-education-market` exist
  as independent branches and were not merged, rebased, or read from.
- Created `feat/p0-five-journey-ux` from verified `main`.

## Gate A — Coverage and Safe Escalation

### A1. Curation

Curated `NBCC-SS-004` (Accessibility and Inclusion Services) and `NBCC-SS-006` (Student
Loans) from their live, approved (`knowledge/sources.yaml`) URLs, following the same
record shape and validation as the existing three curated sources
(`lib/curated-sources.ts`'s `CuratedSource` interface and `validateCuratedSource()`).
Both pages were fetched live in the browser, their real page content extracted (the
page's own content container, not the sitewide navigation menu — the Student Loans page
in particular has a large global nav that is not page content), and written to
`knowledge/curated/NBCC-SS-004.json` and `NBCC-SS-006.json`. Both pass
`validateCuratedCorpus()` with zero issues and are traceable to `knowledge/sources.yaml`
by ID and URL (`traceCuratedSourceToCatalogue()`).

**Content-quality finding, disclosed rather than hidden**: NBCC-SS-004's live page repeats
the link label "View programs" once per staff bio (7 occurrences), contributing 100% of
that page's raw "programs" keyword count with zero distinguishing informational content —
a pure UI affordance, not information. Left in place, the raw body-occurrence count from
this repeated boilerplate alone was enough to flip a previously-passing, unrelated golden
question (GQ-09, a `general_contact` question) to the wrong top-1 result, purely as a side
effect of corpus growth — the "corpus-scaling limitation of exclusive-term weighting"
predicted in `learning-log/DAY_04.md`. This is not a hypothetical: it happened on first
adding the new curated sources, before any other change.

**Diagnosis before fixing (same discipline as Day 4)**: before touching anything, several
generic, query-independent retrieval-scoring changes were tested against the full 10-
question golden set (not just GQ-09) using a standalone script mirroring
`lib/retrieval.ts`'s exact algorithm:

| Candidate | Result |
|---|---|
| sqrt(occurrences) diminishing returns | 9/10 — breaks GQ-02 |
| log2(occurrences+1)×2 | 8/10 — breaks GQ-02 and GQ-09 |
| Uniform cap at 8 | 8/10 — breaks GQ-02 and GQ-09 |
| Uniform cap at 10 | 8/10 — breaks GQ-02 and GQ-09 |
| Zero out "universal" terms (df = corpus size) | 8/10 — breaks GQ-02 |

All were rejected: GQ-02 ("I'm feeling anxious, what resources does NBCC have?") passes
today only via generic terms ("nbcc", "resources") at high raw counts — a known fragility
(`learning-log/DAY_04.md`) — and any generic dampening of raw body counts breaks it. This
confirms the corpus-scaling risk is real and that a retrieval-algorithm change was not a
safe fix here without a much larger, separately-scoped effort (e.g. real stemming), which
was out of scope for this increment.

**Fix applied**: removed the repeated "View programs" link label from
`knowledge/curated/NBCC-SS-004.json`'s `extracted_text` (7 occurrences, all identical,
zero informational content beyond the literal CTA text) and recalculated
`content_length`. All real prose content — staff names, contact details, the
accommodation-process description — is untouched. This is a curation-content decision
(what counts as "informational text" vs. "UI chrome"), not a retrieval-algorithm change
and not a query-specific override: it applies to this page's content regardless of which
question is asked. After this fix, all 10 original golden questions pass, including GQ-09
(NBCC-SS-001 45 vs. NBCC-SS-004 41 — the same relative order as before the new sources
were added, GQ-09 real margin visible in `evals/golden_questions_results.json`).

### A2. Escalation hardening

`lib/escalation.ts`'s `personalized_decision` trigger previously resolved its
`target_service_id` from the (possibly wrong) retrieval-derived `journey` argument — unlike
`crisis_or_safety` and `accommodation_request`, which are hardcoded-safe. This was flagged
as a real, disclosed limitation in Days 5–7 (Trace 5): a financially-framed decision query
like "What are my chances of loan approval?" could, before NBCC-SS-006 was curated, escalate
to `NBCC-SS-002` (Student Success Coaching) instead of a financial contact, purely because
retrieval had misresolved the journey.

Added a `FINANCIAL_DECISION_TERMS` list (distinct from the existing, more general
`PERSONALIZED_DECISION_TERMS`) checked first; a match now always resolves to `NBCC-SS-007`
(Contact NBCC), the target `ESCALATION_POLICY.md`'s Contact Routes table names for
"Financial support: Financial Aid office (contact via NBCC-SS-007)" — independent of the
`journey` argument, matching the existing hardcoded-safe pattern. Non-financial decision
phrasing (e.g. "Which program should I take next semester?") is unaffected and keeps the
prior journey-derived target.

Regression tests added to `tests/escalation.test.ts`:
- A financial decision query with a deliberately wrong `journey` argument
  (`academic_support`) still targets `NBCC-SS-007`.
- The same holds with zero prior retrieval results.
- `accommodation_request` still targets `NBCC-SS-004` even with a wrong `journey` argument
  (no regression).
- GQ-04's wording still targets `NBCC-SS-005` even with a wrong `journey` argument (no
  regression).
- A non-financial decision term still uses the journey-derived target (unhardened by
  design — this hardening is scoped to financial phrasing only, per the instruction).

### A3. Evaluation

Added GQ-11 (accessibility: "How do I get academic accommodations if I have a disability
or learning barrier?", expects `NBCC-SS-004`, `accessibility_inclusion`, escalates via
`accommodation_request` to `NBCC-SS-004`) and GQ-12 (financial: "How do I apply for a
Canada Student Loan or provincial student financial assistance?", expects `NBCC-SS-006`,
`financial_support`, no escalation) to `evals/golden_questions.json`. Both verified against
the real pipeline with clear margins before being added (GQ-11: 25 vs. 16; GQ-12: 57 vs.
31). No existing golden question's expected value was weakened, skipped, inverted, or
conditionally bypassed — GQ-09's expected value (`NBCC-SS-001`) is unchanged; the fix was
to the curated content, not the test's assertion.

`evals/golden_questions_results.json` and `evals/routing_escalation_results.json` were
regenerated from real execution (a temporary, uncommitted Jest test that calls
`searchCuratedSources()` / `routeQuery()` / `decideEscalation()` directly and writes the
results, deleted before committing):

- Retrieval top-1 / top-3 accuracy: **12/12**
- Journey classification accuracy: **12/12**
- Escalation-trigger accuracy: **12/12**
- Escalation-target accuracy: **2/2** (GQ-04 and GQ-11)

## Gate B — Learner Service-Resolution UX

Replaced `app/page.tsx`'s Day 1 concept shell with a learner-facing form: a plain-text
question input, five example-question buttons (Academic support, Wellbeing / safety using
the proven GQ-04 wording, General student services, Accessibility, Financial support),
loading/empty/error states, and a result card.

Added `lib/navigate.ts` — a pure function, `navigate(query)`, that runs the exact same
`searchCuratedSources()` → `routeQuery()` → `decideEscalation()` pipeline used by
`/dev/routing`, then reshapes it into a plain-language, learner-safe result: journey label,
what to do next, a one-sentence why, the approved source (if any), escalation state with a
calm per-trigger message and named target, and an immediate-danger notice specifically for
`wellbeing_safety`. No raw scores or `matched_terms` are exposed in this shape.

Added `app/api/navigate/route.ts` — `GET /api/navigate?q=<query>`, a production-safe
endpoint (no `NODE_ENV` gating, unlike `/api/dev/routing`) returning only that learner-safe
shape. No personal data is accepted or stored: the query is processed in memory for one
request and never written to a file, database, or log.

**Real bug caught by browser verification, not just tests**: an initial version imported
`NavigateResult` and `JOURNEY_LABELS` as ordinary value imports from `lib/navigate.ts` in
the `'use client'` homepage. Because `lib/navigate.ts` imports `lib/escalation.ts`, which
imports `lib/sources.ts` (used for `getSourceById()`), and `lib/sources.ts` has a runtime
`require('jsdom')` used for HTML extraction, the whole chain was bundled into client
JavaScript — where `jsdom`'s `http-proxy-agent` dependency requires Node's `net` module,
which does not exist in a browser bundle. `npm test` did not catch this (Jest runs in
Node), but `npm run dev` + loading the page in a real browser did, with a clear
"Module not found: Can't resolve 'net'" error. Fixed by extracting the plain-language
journey-label map into its own dependency-free module, `lib/journey-labels.ts`, and
changing the homepage's `NavigateResult` import to `import type` so no runtime import of
`lib/navigate.ts` reaches the client bundle at all.

Verified live in the browser (desktop and mobile 375×812 viewport) against the real
`/api/navigate` endpoint: the GQ-04 scenario button correctly shows the immediate-danger
notice, the escalation box, and the `NBCC-SS-005` contact; the Financial support scenario
button correctly shows `NBCC-SS-006` with no escalation; a deliberately unmatched query
correctly shows "we do not have an approved source" and offers `NBCC-SS-007`. One wording
bug found during this manual verification — a target titled "Contact NBCC" produced
"Contact Contact NBCC directly..." — was fixed in `lib/navigate.ts` and covered by a
regression test in `tests/navigate-api.test.ts`.

New tests: `tests/navigate-api.test.ts` (6 tests, calling the route handler directly with
a real `NextRequest`) and `tests/page.test.tsx` (6 tests, `@testing-library/react` with
`@jest-environment jsdom`, mocking `fetch`) — covering submit, the GQ-04 safety result, the
no-source fallback, the demonstrator notice, and a fetch-failure error state. No new npm
dependency was added: `@testing-library/react` and `@testing-library/jest-dom` were already
present as unused devDependencies.

## Verification

```
npm ci      # 408 packages, 0 errors
npm test    # 177/177 passing (12 suites)
npm run build   # succeeds, 11 routes (up from 10 — new /api/navigate)
NODE_ENV=production npm start:
  GET /api/dev/sources    -> 404
  GET /api/dev/retrieval  -> 404
  GET /api/dev/routing    -> 404
  GET /api/health         -> 200
  GET /                   -> 200
  GET /api/navigate?q=... -> 200
```

`next-env.d.ts`, `tsconfig.json` (auto-modified by `next dev`/`build`/`start`) were
reverted before each commit; `AGENTS.md`/`CLAUDE.md` (auto-regenerated) were deleted before
each commit. `git status --short` was clean before every commit (no `.next/`,
`node_modules/`, temporary diagnostic test files, or other generated artifacts staged).

## Files Changed

**Gate A** (commit `6ee115b`): `knowledge/curated/NBCC-SS-004.json` (new),
`knowledge/curated/NBCC-SS-006.json` (new), `lib/escalation.ts`, `lib/routing.ts` (stale
module-comment fix only), `tests/curated-sources.test.ts`, `tests/escalation.test.ts`,
`tests/golden-questions.test.ts`, `tests/routing-escalation-golden-questions.test.ts`,
`evals/golden_questions.json`, `evals/golden_questions_results.json`,
`evals/routing_escalation_results.json`.

**Gate B** (commit `9759d8f`): `app/api/navigate/route.ts` (new), `lib/journey-labels.ts`
(new), `lib/navigate.ts` (new), `app/page.tsx`, `app/globals.css`,
`tests/navigate-api.test.ts` (new), `tests/page.test.tsx` (new).

**Gate C** (this commit): `product/BACKLOG.md`,
`docs/design-partner-readiness/README.md`,
`docs/design-partner-readiness/evidence-inventory.md`,
`docs/design-partner-readiness/service-resolution-traces.md`,
`docs/design-partner-readiness/executive-narrative.md`,
`docs/design-partner-readiness/governance-evidence-dossier.md`,
`docs/design-partner-readiness/pilot-charter.md`,
`docs/design-partner-readiness/measurement-design.md`,
`learning-log/P0_COVERAGE_UX.md` (new).

No file under `policies/`, `product/PRODUCT_CHARTER.md`, `product/SCOPE.md`, or
`AI_OPERATING_INSTRUCTIONS.md` was touched. `package.json` is unchanged — no new
dependency was added.

## Residual Limitations (Carried Forward or Newly Surfaced)

1. **No stemming or word-form normalization** (carried forward, `learning-log/DAY_04.md`).
2. **Corpus-scaling limitation of exclusive-term weighting** (carried forward, now
   materially demonstrated by the GQ-09/NBCC-SS-004 finding above, not just theoretical).
3. **GQ-02 retrieval fragility** (carried forward) — this is the specific reason several
   otherwise-reasonable generic retrieval-scoring fixes could not be used in Gate A.
4. **No real-data or live-workflow validation** (carried forward).
5. **NBCC-SS-006's curated content is comparatively thin** (newly observed) — the live
   Student Loans page is mostly a list of accordion-section headings rather than expanded
   prose; retrieval still succeeds by a wide margin today, but this page has less
   substantive text than the other four curated sources.
6. **Two approved sources remain uncurated**: `NBCC-SS-003` (a PDF document, not a
   webpage — a different extraction path not attempted here) and `NBCC-SS-007` (the
   contact-routing page, used directly by hardcoded escalation targets rather than
   through retrieval). Neither is required for any of the five canonical journeys'
   informational retrieval today.

## Confirmation of No Prohibited Scope

No LLM, embedding, model provider, or AI runtime was added. No real or personal student
data was introduced — all curated content is public NBCC web content, and all example/test
queries are synthetic. No external system, write integration, authentication, or
production staff portal was added. No autonomous high-stakes decision was introduced —
every escalation still names a human contact. No new npm dependency was added. No content
from `docs/adr-value-led-hybrid-ai` or `research/canadian-education-market` was merged,
rebased, or read from.

## Next Product-Owner Decision

- Whether to merge this PR (not done here, per instruction).
- Whether to curate `NBCC-SS-003` and `NBCC-SS-007` as well, for completeness.
- Whether `NBCC-SS-006`'s thin content (limitation 5) warrants requesting additional
  approved financial-aid source material from NBCC before treating this journey as
  design-partner-ready.
- Whether the learner UI's copy and design should go through an accessibility/UX review
  before any design-partner demonstration, beyond the automated component tests here.
