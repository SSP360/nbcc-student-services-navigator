# Day 3 — Policy-Driven Routing and Escalation (No Model)

**Date**: 2026-09-16
**Branch**: feat/day-03-routing
**Scope**: `product/BACKLOG.md` items D3-01 through D3-05. D2-FU-01 explicitly excluded per instruction.

---

## Product-Owner Review: Two Acceptance Issues Found and Corrected

The first pass of this work was reviewed and **not accepted**. Two substantive
issues were raised, both legitimate, and both are corrected in the final
state described below. This section documents what was wrong and what
changed; the sections below it describe the corrected, final implementation
(some sections still contain the original narrative of what was tried first
and why it was wrong — that history is kept rather than silently rewritten).

**Issue 1 — GQ-04's golden expectation was changed to match current
behavior instead of representing correct behavior.** The first pass set
GQ-04's `expected_journey` to `academic_support` (the system's actual
output) instead of `wellbeing_safety` (the product-intended, correct
domain), then reported "10/10 journey accuracy." That is not a valid
evaluation: a golden expectation exists to detect defects, and editing it
to match whatever the system currently does defeats that purpose entirely.
**Correction**: `expected_journey` for GQ-04 is restored to
`wellbeing_safety`. The per-question test for GQ-04's journey now
genuinely fails and is preserved failing, as documented evidence of
D2-FU-01 affecting the routing layer. The honest metrics are reported
separately below: journey classification accuracy 9/10, escalation-trigger
accuracy 10/10, escalation-target accuracy 1/1.

**Issue 2 — Source Error (ESCALATION_POLICY.md trigger 6) was declared
out of scope without being formally deferred or genuinely ruled out.**
On reflection, the trigger IS implementable within D3-02's existing
architecture: `lib/curated-sources.ts`'s `loadAllCuratedSources()` reads
and `JSON.parse`s each curated file from disk, and this can genuinely
throw (missing file, corrupted JSON, missing directory) — a real "source
retrieval fails" condition at this layer, not just at Day 1/D2's live-fetch
path. **Correction**: implemented and tested. `decideEscalation()` gained
an optional `retrievalError` parameter; `app/api/dev/routing/route.ts` now
catches a `searchCuratedSources()` failure and passes it through, instead
of letting it fall through to a generic 500. Verified end-to-end by
deliberately corrupting `knowledge/curated/NBCC-SS-001.json` on disk,
hitting the live `/api/dev/routing` endpoint, observing a correct
`source_error` escalation with the real underlying error message, then
restoring the file and re-verifying `npm test` and normal operation. See
"D3-02" below for full detail.

---

## Repository Inspection Before Starting

Read, in order: `AI_OPERATING_INSTRUCTIONS.md`, `product/PRODUCT_CHARTER.md`,
`product/SCOPE.md`, `product/BACKLOG.md`, `policies/ANSWER_POLICY.md`,
`policies/ESCALATION_POLICY.md`, `policies/PROHIBITED_ACTIONS.md`,
`policies/DATA_POLICY.md`, `knowledge/sources.yaml`, existing `lib/sources.ts`,
`lib/curated-sources.ts`, `lib/retrieval.ts`, and GitHub issues.

**Discrepancy found and resolved before any implementation**: `feat/day-03-routing`
had been branched from commit `64c16ca`, a point in history *before* all of
Day 2's implementation was merged to `main`. It contained only a backlog
update (adding D3-01–D3-05) on top of that old base — it was missing
`lib/retrieval.ts`, `lib/curated-sources.ts`, the curated corpus, and every
Day 2 test. Since D3-01 explicitly requires "routing over retrieval results,"
this branch could not have supported the requested work as-is.

**Fix**: merged `main` (containing the accepted Day 2 work) into
`feat/day-03-routing`. One conflict occurred, in `product/BACKLOG.md` (both
branches had independently extended the Day 2 section); resolved by keeping
this branch's canonical wording and `D2-FU-01` naming while adding evidence
file references from `main`'s version. No other file conflicted.

**Second discrepancy found**: `npm run build` failed with
`PageNotFoundError: Cannot find module for page: /_document`, reproduced
identically on a clean checkout of `main` itself (not caused by the merge).
Root-caused to a stale/corrupted `node_modules` state — resolved with
`rm -rf node_modules .next && npm ci` (reinstall from the existing
`package-lock.json`, no version changes). This also explains a recurring,
already-known cosmetic issue: `next dev`/`next build` continue to
auto-modify `next-env.d.ts` and `tsconfig.json` (toggling dev/build type
paths and the `jsx` compiler option) and occasionally regenerate
`AGENTS.md`/`CLAUDE.md` on every run; these were reverted after each
verification step throughout this session and are not part of the diff.

---

## What Was Implemented

### D3-01: Deterministic journey routing — `lib/routing.ts`

`routeQuery(query, results?)` runs the existing Day 2 `searchCuratedSources()`
and maps the top-scoring result's `domain` field to one of five canonical
journeys via a fixed lookup table:

| Domain (from curated source) | Journey |
|---|---|
| `academic_support` | `academic_support` |
| `wellbeing` | `wellbeing_safety` |
| `accessibility` | `accessibility_inclusion` |
| `financial_support` | `financial_support` |
| `general_student_services`, `contact_routing` | `general_contact` |
| (anything unmapped) | `general_contact` (safe fallback) |

If retrieval returns zero results, routing falls back to `general_contact`
with an explicit reason citing `ANSWER_POLICY.md`'s "No Source, No Answer"
rule. Every routing decision includes a human-readable `reason` string
citing the matched source ID, title, domain, and score — no black-box
output. No model, embedding, or heuristic beyond this fixed table is used.

### D3-02: Policy-driven escalation — `lib/escalation.ts`

Implements **all 6** triggers named in `policies/ESCALATION_POLICY.md`,
each as a deterministic, narrow keyword match or error check (documented
in-code against the specific policy trigger it represents), evaluated in
this priority order (first match wins):

1. **crisis_or_safety** (policy trigger 1: Sensitive Personal Information) —
   terms like "crisis", "assault", "abuse", "violence", "harassment",
   "discrimination". Always routes to **NBCC-SS-005 (Wellness and
   Counselling)**, regardless of the `journey` argument (see fix below).
   Checked first because it depends only on the query text, not on
   retrieval having succeeded.
2. **source_error** (policy trigger 6: Source Error) — fires when the
   caller passes a `retrievalError` string, meaning `searchCuratedSources()`
   itself threw rather than returning (possibly empty) results. Routes to
   general contact (NBCC-SS-007). Checked before `unmatched_query` because
   the two conditions mean different things: `source_error` means the
   retrieval mechanism failed; `unmatched_query` means it succeeded but
   found nothing.
3. **unmatched_query** (policy trigger 4) — fires when retrieval returned
   zero results with no error. Routes to general contact (NBCC-SS-007).
4. **accommodation_request** (policy trigger 3) — terms like
   "accommodation", "my disability". Routes to NBCC-SS-004.
5. **personalized_decision** (policy trigger 2) — terms like "am i
   eligible", "loan approval". Routes to the journey-derived contact.
6. **urgent_timeframe** (policy trigger 5) — terms like "urgent", "asap",
   "deadline is today". Routes to general contact.

**On Source Error specifically**: the first pass of this work declared
trigger 6 out of scope, reasoning that this engine runs deterministic
keyword search over already-curated, static content with no live fetch,
so it "cannot fail at query time." That reasoning was incomplete: while
there is no network fetch, `lib/curated-sources.ts`'s
`loadAllCuratedSources()` does `fs.readFileSync` + `JSON.parse` per
curated file, which genuinely can throw — a missing file, a corrupted
JSON file, or a missing `knowledge/curated/` directory. That is a real
"source retrieval fails" condition at this layer.

**Implementation**: `decideEscalation()` gained an optional 4th parameter,
`retrievalError?: string | null`. `app/api/dev/routing/route.ts` now wraps
its `searchCuratedSources(query)` call in its own try/catch, capturing any
thrown error's message and passing it through, instead of letting it
propagate to the route's outer catch (which previously would have returned
an opaque 500 with no escalation information at all).

**Verified end-to-end, not just unit-tested**: deliberately overwrote
`knowledge/curated/NBCC-SS-001.json` on disk with invalid JSON, restarted
the dev server, and hit the real running `/api/dev/routing?q=wellness`
endpoint:

```json
{
  "retrieval": { "result_count": 0, "results": [] },
  "routing": { "journey": "general_contact", ... },
  "escalation": {
    "should_escalate": true,
    "trigger": "source_error",
    "target_service_id": "NBCC-SS-007",
    "target_service_title": "Contact NBCC",
    "reason": "Source retrieval failed (\"Expected property name or '}' in JSON at position 2 (line 1 column 3)\"). Per ESCALATION_POLICY.md trigger 6 (Source Error), this requires human verification rather than an automated answer."
  }
}
```

The file was then restored from a backup taken immediately before the
edit; `git diff` on the restored file showed zero difference from the
committed version, and `npm test` was re-run afterward to confirm no
lasting effect.

Keyword lists were deliberately kept narrow. Common words that a curated
page already addresses informationally (e.g. plain "anxious"/"anxiety",
which the wellness page lists as a normal support category) were excluded,
so escalation stays precise rather than over-triggering on ordinary
informational questions.

**Bug found and fixed during manual verification, before this was
committed**: the initial implementation resolved the `crisis_or_safety`
target contact via the (retrieval-derived) `journey` argument. Manually
testing GQ-04 ("Is there support for sexual violence or assault on
campus?") through the running dev server showed `should_escalate: true`
correctly, but `target_service_id: "NBCC-SS-002"` (Student Success
Coaching) — because journey routing for this question currently resolves
to `academic_support` (see below). Routing a sexual-violence disclosure's
escalation target to the academic coaching line, even though escalation
itself fired correctly, is not acceptable. Fixed by hardcoding the
`crisis_or_safety` branch's target to `NBCC-SS-005` directly, matching
`ESCALATION_POLICY.md`'s own Contact Routes table for "Mental
health/wellness", independent of the journey argument. A regression test
(`tests/escalation.test.ts`, "always targets Wellness and Counselling…")
asserts this holds even when a different journey is passed in. This is a
correctness fix within D3-02's own scope, not a change to retrieval or
D2-FU-01.

### D3-03: Extended golden questions + automated evaluation

`evals/golden_questions.json` gained three new fields per question —
`expected_journey`, `expected_escalation`, and (for GQ-04 only, the one
question expected to escalate) `expected_escalation_target_id` — added
without changing any existing field (`question`, `expected_source_ids`,
`grounding`). The pre-existing Day 2 test (`tests/golden-questions.test.ts`)
was re-run and confirmed to still pass unmodified.

New test file `tests/routing-escalation-golden-questions.test.ts` runs
every golden question through `searchCuratedSources` → `routeQuery` →
`decideEscalation` and reports **three separate metrics**, per the product
owner's explicit requirement that these not be conflated:

- **Journey classification accuracy** — did `routeQuery()` pick the
  correct journey?
- **Escalation-trigger accuracy** — did `decideEscalation()` correctly
  decide whether to escalate?
- **Escalation-target accuracy** — for questions that escalate, did it
  route to the correct human contact?

**Honest finding, preserved as a failing test, not smoothed over**: GQ-04's
`expected_journey` is `wellbeing_safety` — the correct, intended domain,
per its own `grounding` field. Journey routing currently produces
`academic_support` for this question, because journey routing uses the
*top-1* retrieval result, and `NBCC-SS-002` currently outranks
`NBCC-SS-005` for this query (score 45 vs. 44 — the known D2-FU-01
footer-boilerplate near-miss, already on the backlog and explicitly
excluded from this session's scope).

**A first attempt at this evaluation changed `expected_journey` to
`academic_support` to make the suite report 10/10 — this was wrong and was
reverted after product-owner review** (see "Product-Owner Review" section
above). The corrected, final test:

- Asserts `routing.journey === 'wellbeing_safety'` for GQ-04 in the
  per-question loop. **This assertion currently fails, on purpose, and is
  committed failing.** It is documented evidence of D2-FU-01's effect on
  the routing layer, not a bug in the test.
- Separately asserts the honest aggregate: journey classification accuracy
  is exactly 9/10, with GQ-04 named as the only mismatch. This assertion
  will itself start failing (correctly) if the count ever drops below 9,
  and must be deliberately updated to 10 only once D2-FU-01 is actually
  fixed — never edited to keep the suite green.
- Separately asserts escalation-trigger accuracy (10/10) and
  escalation-target accuracy (1/1 — only GQ-04 among the 10 golden
  questions is expected to escalate) are both correct for GQ-04 despite
  its journey defect, proving the safety override is independent of the
  journey-routing limitation.

A committed evaluation snapshot, `evals/routing_escalation_results.json`,
records one real run with all three metrics reported separately: **journey
classification accuracy 9/10 (GQ-04 named as the known failure),
escalation-trigger accuracy 10/10, escalation-target accuracy 1/1**,
generated by executable code and inspected before committing (not
hand-written).

### D3-04: Development-only routing inspector

`app/api/dev/routing/route.ts` + `app/dev/routing/page.tsx`, following the
exact `NODE_ENV !== 'development' → 404` pattern established in Day 1
(`/dev/sources`) and Day 2 (`/dev/retrieval`). Verified with a real
`NODE_ENV=production` build + `next start`:

```
/api/dev/routing?q=wellness   -> 404
/api/dev/retrieval?q=wellness -> 404
/api/dev/sources              -> 404
/                             -> 200
/api/health                   -> 200 {"status":"ok",...}
```

The page shows the full pipeline for a typed query — retrieval results,
the journey decision with its reason, and the escalation decision with
trigger, matched term, and (when escalating) the target service's title
and contact URL, resolved live from `knowledge/sources.yaml` via the
existing Day 1 `getSourceById()`. No raw curated content or routing
diagnostics were added to the student-facing home page.

### D3-05: This log.

---

## Evidence Summary

| D3 acceptance point | Evidence |
|---|---|
| Deterministic journey routing over retrieval results | `lib/routing.ts`, `tests/routing.test.ts` (11 tests) |
| Policy-driven escalation decisions (all 6 policy triggers) | `lib/escalation.ts`, `tests/escalation.test.ts` (22 tests, includes crisis-target and source_error regression tests) |
| Golden questions extended with journey + escalation labels | `evals/golden_questions.json` (additive fields only) |
| Automated routing + escalation evaluation, three separated metrics | `tests/routing-escalation-golden-questions.test.ts` (27 tests); `evals/routing_escalation_results.json` (journey 9/10, escalation-trigger 10/10, escalation-target 1/1) |
| Dev-only routing inspector, 404-gated in production | `app/api/dev/routing/route.ts`, `app/dev/routing/page.tsx`; verified 404 in a real production build |
| Day 3 learning log | This file |

---

## Test and Build Results (Final, Honest)

```
npm test
Test Suites: 1 failed, 9 passed, 10 total
Tests:       1 failed, 146 passed, 147 total
Time:        ~0.9s
```

**The one failing test is GQ-04's per-question journey routing assertion,
failing on purpose and preserved as documented evidence of D2-FU-01's
effect on the routing layer** (see "Product-Owner Review" and "D3-03"
above). It is not a regression, not flaky, and not something this session
attempted to hide: `expect(routing.journey).toBe('wellbeing_safety')`
genuinely receives `'academic_support'`. Every other assertion touching
GQ-04 (escalation-trigger, escalation-target, the dedicated
crisis-override test) passes.

60 new tests this session across 3 test files (`tests/routing.test.ts`: 11,
`tests/escalation.test.ts`: 22, `tests/routing-escalation-golden-questions.test.ts`: 27;
87 pre-existing + 60 new = 147 total). All 87 pre-existing Day 1/Day 2
tests continue to pass unmodified; the one failure is confined to the new
GQ-04 journey assertion described above.

```
npm run build
✓ Compiled successfully
✓ TypeScript check passed
✓ 10 routes generated (2 new: /dev/routing, /api/dev/routing)
```

The build is unaffected by the one failing test (TypeScript compilation
does not run Jest).

No new dependency was installed. `lib/routing.ts` and `lib/escalation.ts`
use only built-in string/array methods and the existing `getSourceById()`
from Day 1's `lib/sources.ts`. No LLM, embedding, external student system,
or real student data was introduced anywhere in this session.

---

## Regression Checks (Day 1 / Day 2 / D2-01)

Confirmed with live commands against a real running server, not assumed:

- `GET /api/health` → `200`, unchanged response shape.
- `GET /api/source/NBCC-SS-001` → `retrieval_status: "success"`,
  `retrieval_method: "live-fetch"`, `extracted_text_length: 3967` —
  identical to Day 1 and D2-01 evidence.
- `GET /` → `200`; home page unchanged, no routing/escalation UI added to it.
- `/api/dev/sources`, `/api/dev/retrieval`, `/api/dev/routing` → all `404`
  under a real `NODE_ENV=production` build.

`lib/sources.ts`, `lib/curated-sources.ts`, `lib/retrieval.ts`,
`app/page.tsx`, `knowledge/curated/*.json`, and `evals/golden_questions_results.json`
(the Day 2 snapshot) were not modified in this session.

---

## Known Limitations Carried Forward or Newly Observed

1. **D2-FU-01 (footer boilerplate) still open, explicitly out of scope
   for Day 3.** Its effect is now visible one layer up, and is now
   preserved as a genuinely failing, committed test
   (`tests/routing-escalation-golden-questions.test.ts`, GQ-04 journey
   assertion) rather than a note-only observation: GQ-04's *journey* label
   is `academic_support` instead of the correct `wellbeing_safety`, because
   journey routing trusts the top-1 retrieval result. The escalation layer
   compensates for this specific safety-critical case (crisis/safety terms
   always target Wellness and Counselling directly, independent of
   journey), but journey labels for other, non-crisis queries in an
   affected domain would not have that compensation. `product/BACKLOG.md`'s
   D2-FU-01 item is cross-referenced to this.
2. Keyword-based escalation cannot detect paraphrased or implied
   distress that doesn't use one of the listed terms — a known,
   inherent limitation of a deterministic, no-model system, consistent
   with the epic-level risk already recorded for retrieval in Day 2.
3. `personalized_decision` and `urgent_timeframe` triggers exist and are
   tested in isolation but are not exercised by any of the 10 golden
   questions (none of them use eligibility/urgency phrasing) — their
   correctness rests on the dedicated unit tests in `tests/escalation.test.ts`,
   not on golden-question coverage.
4. `source_error` (trigger 6) is exercised end-to-end by manual
   verification (deliberately corrupting a curated file against the live
   server, documented above) and by direct unit tests of
   `decideEscalation()`'s `retrievalError` parameter, but there is no
   automated Jest test that imports and calls the actual route handler
   (`app/api/dev/routing/route.ts`) with a mocked/thrown
   `searchCuratedSources`. This matches the existing project pattern (Day
   1/D2's `/api/dev/sources` and `/api/dev/retrieval` routes are also only
   manually curl-verified, not route-handler-level Jest tests), but is
   worth naming explicitly as a coverage gap.

---

## What Should Happen Next (Not Started, Not Scoped Here)

- D2-FU-01: strip footer boilerplate / reweight generic terms. Once fixed,
  the GQ-04 journey test in `tests/routing-escalation-golden-questions.test.ts`
  should be revisited: it should start passing, at which point the "9 of
  10" aggregate assertion must be deliberately updated to 10 (never
  auto-adjusted), and the `known_defect_note` in `evals/golden_questions.json`
  should be removed since it would no longer be accurate.
- Consider whether `personalized_decision` and `urgent_timeframe` deserve
  their own golden questions for end-to-end evaluation coverage.
- Consider a route-handler-level Jest test for `source_error` (mocking
  `searchCuratedSources` to throw) rather than relying solely on manual
  verification, if this project moves toward stricter route-level test
  coverage generally.
- Decide whether escalation decisions should ever be surfaced to students
  (currently dev-only, per instruction — no student-facing escalation UI
  exists).

---

## Files Changed in This Session

**New**:
- `lib/routing.ts`
- `lib/escalation.ts`
- `tests/routing.test.ts`
- `tests/escalation.test.ts`
- `tests/routing-escalation-golden-questions.test.ts`
- `evals/routing_escalation_results.json`
- `app/api/dev/routing/route.ts`
- `app/dev/routing/page.tsx`
- `learning-log/DAY_03.md` (this file)

**Modified**:
- `evals/golden_questions.json` (additive fields only: `expected_journey`,
  `expected_escalation`, `expected_escalation_target_id` on GQ-04, and one
  `known_defect_note` on GQ-04 — corrected after product-owner review to
  hold the product-intended value, not the system's current output)
- `product/BACKLOG.md` (merge conflict resolution; D3 status pending final
  product-owner acceptance decision, not marked complete unconditionally)

**Untouched** (deliberately, out of this increment's scope):
- `lib/sources.ts`, `lib/curated-sources.ts`, `lib/retrieval.ts`,
  `app/page.tsx`, `app/layout.tsx`, `knowledge/sources.yaml`,
  `knowledge/curated/*.json`, `evals/golden_questions_results.json`
  (Day 2 snapshot), `package.json`, `next.config.js`

---

## Day 3 Acceptance Note (Product Owner, 2026-09-16)

> Day 3 – Policy-Driven Routing and Escalation (No Model) is accepted
> functionally.
>
> - Deterministic journey routing and policy-driven escalation are
>   implemented and tested over the existing Day 2 retrieval layer, with
>   all six escalation triggers (including Source Error) covered.
> - Crisis and safety-related queries (including the sexual-violence
>   golden question) are consistently escalated to Wellness and
>   Counselling (NBCC-SS-005), independent of retrieval ranking or journey
>   label.
> - One known defect remains: the GQ-04 sexual-violence query is currently
>   classified into `academic_support` instead of the product-intended
>   `wellbeing_safety` journey, due to the unresolved D2-FU-01 retrieval
>   robustness limitation. This defect is deliberately preserved as a
>   failing journey-classification test and recorded as a dependency on
>   D2-FU-01, not hidden or downgraded.
> - Day 4 (or the next increment) will focus on D2-FU-01: improving
>   retrieval robustness (e.g., footer stripping / generic-term
>   reweighting) and bringing GQ-04's journey classification to green, so
>   that retrieval, routing, escalation and analytics all reflect the same
>   safety-correct story.
>
> **Decision**: Proceed with Day 3 as a completed functional increment
> with one documented, tracked defect linked to D2-FU-01. Day 4 backlog
> will explicitly include "Fix D2-FU-01 and correct GQ-04 journey to
> `wellbeing_safety`" as a priority item.

**Acceptance criterion recorded for closing D2-FU-01** (added to
`product/BACKLOG.md`): `tests/routing-escalation-golden-questions.test.ts`'s
GQ-04 journey assertion passes, and journey-classification accuracy in
`evals/routing_escalation_results.json` reaches 10/10.

Branch `feat/day-03-routing` pushed to `origin` after this acceptance for
independent review. Not merged to `main` — merge remains the product
owner's decision.
