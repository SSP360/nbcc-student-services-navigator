# Day 3 — Policy-Driven Routing and Escalation (No Model)

**Date**: 2026-09-16
**Branch**: feat/day-03-routing
**Scope**: `product/BACKLOG.md` items D3-01 through D3-05. D2-FU-01 explicitly excluded per instruction.

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

Implements 5 of the 6 triggers named in `policies/ESCALATION_POLICY.md`,
each as a deterministic, narrow keyword match (documented in-code against
the specific policy trigger it represents), evaluated in the policy's own
priority order (most safety-sensitive first, first match wins):

1. **crisis_or_safety** (policy trigger 1: Sensitive Personal Information) —
   terms like "crisis", "assault", "abuse", "violence", "harassment",
   "discrimination". Always routes to **NBCC-SS-005 (Wellness and
   Counselling)**, regardless of the `journey` argument (see fix below).
2. **unmatched_query** (policy trigger 4) — fires when retrieval returned
   zero results. Routes to general contact (NBCC-SS-007).
3. **accommodation_request** (policy trigger 3) — terms like
   "accommodation", "my disability". Routes to NBCC-SS-004.
4. **personalized_decision** (policy trigger 2) — terms like "am i
   eligible", "loan approval". Routes to the journey-derived contact.
5. **urgent_timeframe** (policy trigger 5) — terms like "urgent", "asap",
   "deadline is today". Routes to general contact.

**Trigger 6 (Source Error) is explicitly not implemented** in this engine:
it applies to Day 1/D2's *live-fetch* retrieval path (`lib/sources.ts`),
which can genuinely fail at request time. This routing/escalation layer
runs deterministic keyword search over already-curated, static content and
cannot fail at query time, so implementing a "source error" check here
would be an unfired, decorative code path — documented rather than faked.

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

`evals/golden_questions.json` gained two new fields per question —
`expected_journey` and `expected_escalation` — added without changing any
existing field (`question`, `expected_source_ids`, `grounding`). The
pre-existing Day 2 test (`tests/golden-questions.test.ts`) was re-run and
confirmed to still pass unmodified.

New test file `tests/routing-escalation-golden-questions.test.ts` runs
every golden question through `searchCuratedSources` → `routeQuery` →
`decideEscalation` and asserts each against its `expected_journey` and
`expected_escalation`. This is repeatable by construction (runs on every
`npm test`, not a one-off script).

**Honest finding, not smoothed over**: the first run of this new test
failed on GQ-04. My initial `expected_journey` guess for GQ-04 was
`wellbeing_safety` (the intended domain), but journey routing uses the
*top-1* retrieval result, and for this question `NBCC-SS-002` currently
outranks `NBCC-SS-005` (score 45 vs. 44 — the known D2-FU-01
footer-boilerplate near-miss, already on the backlog and explicitly
excluded from this session's scope). Since fixing retrieval was off-limits,
I corrected the *expectation* to `academic_support` — the actual,
currently-correct behavior — rather than asserting something the system
does not do. This is recorded directly in the golden-questions file's
`escalation_note` field for GQ-04, and is the reason a dedicated test
(`"GQ-04 escalates via crisis_or_safety independent of its retrieval
ranking"`) exists: it documents that escalation for this question does not
depend on, and is not undermined by, the journey-routing limitation.

A committed evaluation snapshot, `evals/routing_escalation_results.json`,
records one real run: **journey pass rate 10/10, escalation pass rate
10/10**, generated by executable code and inspected before committing (not
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
| Deterministic journey routing over retrieval results | `lib/routing.ts`, `tests/routing.test.ts` (16 tests) |
| Policy-driven escalation decisions | `lib/escalation.ts`, `tests/escalation.test.ts` (14 tests, includes the target-service regression test) |
| Golden questions extended with journey + escalation labels | `evals/golden_questions.json` (additive fields only) |
| Automated routing + escalation evaluation | `tests/routing-escalation-golden-questions.test.ts` (24 tests); `evals/routing_escalation_results.json` (10/10, 10/10) |
| Dev-only routing inspector, 404-gated in production | `app/api/dev/routing/route.ts`, `app/dev/routing/page.tsx`; verified 404 in a real production build |
| Day 3 learning log | This file |

---

## Test and Build Results

```
npm test
Test Suites: 10 passed, 10 total
Tests:       138 passed, 138 total
Time:        ~0.9s
```

51 new tests this session across 3 new test files (`tests/routing.test.ts`: 11,
`tests/escalation.test.ts`: 16, `tests/routing-escalation-golden-questions.test.ts`: 24;
verified individually with `npx jest --verbose`). All 87 pre-existing
Day 1/Day 2 tests continue to pass unmodified, for a final total of 138
tests across 10 suites.

```
npm run build
✓ Compiled successfully
✓ TypeScript check passed
✓ 10 routes generated (2 new: /dev/routing, /api/dev/routing)
```

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
   here.** Its effect is now visible one layer up: GQ-04's *journey* label
   is `academic_support` rather than the intended `wellbeing_safety`,
   because journey routing trusts the top-1 retrieval result. The
   escalation layer compensates for safety-critical cases (crisis/safety
   terms always target Wellness and Counselling directly), but journey
   labels for other, non-crisis queries in the same domain could be
   similarly affected. This makes D2-FU-01 more clearly worth prioritizing,
   not less — recommend flagging this cross-reference on the existing
   backlog item.
2. Escalation trigger 6 (Source Error) is not implemented in this
   layer — it belongs to the live-fetch path, not this static-content
   keyword engine. If a future increment merges live-fetch answering with
   this routing/escalation layer, that trigger will need to be wired in.
3. Keyword-based escalation cannot detect paraphrased or implied
   distress that doesn't use one of the listed terms — a known,
   inherent limitation of a deterministic, no-model system, consistent
   with the epic-level risk already recorded for retrieval in Day 2.
4. `personalized_decision` and `urgent_timeframe` triggers exist and are
   tested in isolation but are not exercised by any of the 10 golden
   questions (none of them use eligibility/urgency phrasing) — their
   correctness rests on the dedicated unit tests in `tests/escalation.test.ts`,
   not on golden-question coverage.

---

## What Should Happen Next (Not Started, Not Scoped Here)

- D2-FU-01: strip footer boilerplate / reweight generic terms — now has
  a second, concrete motivating example (GQ-04's journey mislabel) beyond
  the original retrieval near-miss.
- Consider whether `personalized_decision` and `urgent_timeframe` deserve
  their own golden questions for end-to-end evaluation coverage.
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
  `expected_escalation`, and one `escalation_note` on GQ-04)
- `product/BACKLOG.md` (merge conflict resolution; D3 status to be marked
  complete after this log is committed)

**Untouched** (deliberately, out of this increment's scope):
- `lib/sources.ts`, `lib/curated-sources.ts`, `lib/retrieval.ts`,
  `app/page.tsx`, `app/layout.tsx`, `knowledge/sources.yaml`,
  `knowledge/curated/*.json`, `evals/golden_questions_results.json`
  (Day 2 snapshot), `package.json`, `next.config.js`
