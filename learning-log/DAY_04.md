# Day 4 — Retrieval Robustness and Journey Correction (D2-FU-01)

**Date**: 2026-09-16
**Branch**: feat/day-04-retrieval-robustness
**Base**: `main` @ `425c7026f27870553b5d90c3e764d5d007969ede`
**Scope**: Close `D2-FU-01` and bring GQ-04's journey classification to green, using only
the product-owner-approved Remedy 1 (document-frequency exclusive-term weighting).
Footer stripping, uniform frequency caps, stemming, GQ-04-specific overrides, and any
model/embedding/dependency/integration were explicitly out of scope and not implemented.

---

## Root Cause (Phase A Diagnosis, Approved Before Implementation)

Reproduced through the real `searchCuratedSources` engine, not assumed:

```
Before fix:
NBCC-SS-002: score 45 — "support" (inDomain: true, +3; body×22) + "campus" (body×20)
NBCC-SS-005: score 44 — "support" (body×16) + "sexual" (body×4) + "violence" (body×3)
                        + "assault" (body×1) + "campus" (body×20)
```

Two compounding factors:

1. **Domain-substring false positive**: `academic_support`'s domain slug literally
   contains the substring "support", so any query containing that common word earns
   NBCC-SS-002 an undeserved domain-match bonus, unrelated to the query's actual topic.
2. **No notion of discriminating power in body scoring**: "support" and "campus" occur
   in **all three** curated documents (verified by direct count: support 7/22/16,
   campus 11/20/20) and therefore cannot distinguish between sources, yet their raw
   frequency dominated the score — drowning out "sexual"/"violence"/"assault", which are
   exclusive to NBCC-SS-005 and maximally discriminating but numerically rare (0/0/4,
   0/0/3, 0/0/1).

**Correction to the original D2-FU-01 hypothesis**: the originally-suspected culprit,
"campus" footer boilerplate, was verified to be **score-neutral** between the two
competing sources — it contributed +20 to both identically (confirmed by simulating the
exact byte-identical 883-character shared footer suffix stripped from all three curated
documents: GQ-04's relative margin was unchanged, 36 vs 35, still a 1-point gap). Footer
stripping alone does not and would not have fixed GQ-04. This is why it was excluded from
Phase B's scope.

---

## Rejected Alternatives (Tested, Not Just Reasoned About)

Before recommending Remedy 1, two other approaches were empirically tested against the
real corpus and the real 10-question golden set, and both were rejected based on that
evidence — not assumption:

1. **Uniform body-occurrence frequency cap** (e.g., cap every term's raw count at 3–5
   before weighting). This fixes GQ-04 but **regresses GQ-02** ("I'm feeling anxious,
   what resources does NBCC have?") to the wrong source. Investigation showed GQ-02's
   query term "anxious" does not match the corpus at all (word-form mismatch with
   "anxiety" — no stemming), so GQ-02 was already passing only by coincidence, via the
   generic terms "nbcc" and "resources." A uniform cap suppresses exactly those terms,
   flipping GQ-02. Rejected: too blunt, breaks an already-passing case.
2. **"Require full domain-slug phrase" for the domain-match bonus** (e.g., only award
   NBCC-SS-002 credit for "support" if the query also contains "academic"). This fixes
   GQ-04 but **regresses GQ-10** ("What is the NBCC Student Learning Experience
   Charter?"), whose already-razor-thin 56-vs-55 margin depends on a *partial*
   domain-slug match ("student" against `general_student_services`). Removing that
   partial-match credit drops NBCC-SS-001 to 53, below NBCC-SS-002's unchanged 55.
   Rejected: not selective enough — "student" and "services" are corpus-universal words
   too, so a uniform "require full phrase" rule cannot distinguish GQ-04's coincidental
   overlap from GQ-10's legitimate one.

These two rejections are the direct evidence for why the approved remedy needed to be
additive (only ever increases specific, rare terms' weight) rather than subtractive
(discounting or capping terms used elsewhere in the corpus) — a subtractive change has a
much larger, harder-to-predict blast radius across an already-fragile-margin corpus.

---

## Approved Remedy: Document-Frequency Exclusive-Term Weighting

Implemented in `lib/retrieval.ts`. For each query, before scoring, compute how many
curated documents' body text contain each query term at least once (`documentFrequency`).
A term occurring in **exactly one** document is flagged `isExclusiveTerm: true` and its
body-occurrence contribution is multiplied by a fixed constant
(`EXCLUSIVE_TERM_MULTIPLIER = 3`). All other scoring — title weight, domain weight, and
body scoring for non-exclusive (shared) terms — is completely unchanged.

This is strictly additive: a term's weight can only go up (from 1× to 3×), and only when
it is unique to one document. No previously-passing case can be broken by *reducing* a
score it depended on, since no score is ever reduced by this change.

```
After fix:
NBCC-SS-005: score 60 — "support"(16) + "sexual"(4×3=12) + "violence"(3×3=9)
                        + "assault"(1×3=3) + "campus"(20) = 16+12+9+3+20 = 60
NBCC-SS-002: score 45 — unchanged (no exclusive terms matched)
```

Margin: **15 points** (up from a 1-point margin, and the wrong winner).

### Multiplier Selection (Empirically Verified, Not Guessed)

All 10 golden questions were re-scored against the real corpus at multipliers 1.5×, 2×,
3×, and 5× before choosing:

| Multiplier | GQ-04 margin | GQ-10 margin (previously the next-most-fragile case) | Result |
|---|---|---|---|
| 1.5× | 3 | 1.5 | All pass, but fragile |
| 2× | 7 | 2 | All pass |
| **3×** | **15** | **3** | **All pass, comfortable margins — selected** |
| 5× | 31 | 5 | All pass, most conservative |

3× was chosen as the smallest multiplier that gives every golden question (not just
GQ-04) a margin of at least 3 points, balancing "smallest deterministic change that
works" against "not so close to the boundary that a future corpus edit could re-break it."

---

## Verification: All 10 Golden Questions, Real Execution

| ID | Expected | Journey (before → after) | Top-1 retrieval (before → after) |
|---|---|---|---|
| GQ-01 | wellbeing_safety | wellbeing_safety → wellbeing_safety | SS-005 → SS-005 |
| GQ-02 | wellbeing_safety | wellbeing_safety → wellbeing_safety | SS-005 → SS-005 |
| GQ-03 | wellbeing_safety | wellbeing_safety → wellbeing_safety | SS-005 → SS-005 |
| **GQ-04** | **wellbeing_safety** | **academic_support → wellbeing_safety** | **SS-002 → SS-005** |
| GQ-05 | academic_support | academic_support → academic_support | SS-002 → SS-002 |
| GQ-06 | academic_support | academic_support → academic_support | SS-002 → SS-002 |
| GQ-07 | academic_support | academic_support → academic_support | SS-002 → SS-002 |
| GQ-08 | general_contact | general_contact → general_contact | SS-001 → SS-001 |
| GQ-09 | general_contact | general_contact → general_contact | SS-001 → SS-001 |
| GQ-10 | general_contact | general_contact → general_contact | SS-001 → SS-001 |

Only GQ-04 changed. No other golden question's classification, retrieval ranking, or
escalation behavior was altered — verified by regenerating `evals/golden_questions_results.json`
and `evals/routing_escalation_results.json` from real execution and diffing against the
prior committed snapshots.

---

## Tests Added (Focused Regression Coverage)

`tests/retrieval.test.ts`, new `describe` blocks:

- **"document-frequency exclusive-term weighting"** (4 tests, synthetic 3-source
  fixtures): proves a document-frequency-1 term is flagged `isExclusiveTerm: true` and
  receives exactly the 3× multiplier on its body contribution (`5 occurrences × 1 × 3 =
  15`, asserted precisely); proves a document-frequency-3 term is flagged `false` and
  receives no multiplier; proves an exclusive term can outrank a much-higher-raw-count
  shared term; proves document frequency is computed fresh per query, not cached
  stale across unrelated queries.
- **"GQ-04 regression (D2-FU-01 fix)"** (1 test, real curated corpus): asserts NBCC-SS-005
  is the top result for GQ-04's exact wording, and that the safety-critical terms
  ("sexual", "violence", "assault") are flagged exclusive while the generic terms
  ("support", "campus") are not.

`tests/routing-escalation-golden-questions.test.ts`: the two Day 3 tests that
deliberately asserted the *known-broken* behavior (`journey classification accuracy: 9 of
10` and `GQ-04 escalation target is correct... despite its journey-classification
defect`) were updated to assert the corrected, now-true behavior (10 of 10; journey ==
`wellbeing_safety`). This is not a change to any golden-question expected value — it is
updating tests that existed specifically to document a defect that no longer exists.

---

## Test, Build, and Production-Gating Results

```
npm test
Test Suites: 10 passed, 10 total
Tests:       152 passed, 152 total
```

No deliberately failing test remains. 152 = 147 (Day 1–3 baseline) + 5 new focused
regression tests (4 exclusive-term-weighting unit tests + 1 GQ-04 real-corpus regression
test).

```
npm run build
✓ Compiled successfully, TypeScript check passed, 10 routes generated
```

Production-mode gating, verified against a real `NODE_ENV=production` build:

```
/api/dev/sources    -> 404
/api/dev/retrieval  -> 404
/api/dev/routing    -> 404
/api/health         -> 200 {"status":"ok",...}
```

Live GQ-04 verification against the real running dev-mode API
(`GET /api/dev/routing?q=...`):

```json
{
  "journey": "wellbeing_safety",
  "top_source": "NBCC-SS-005",
  "top_score": 60,
  "second_source": "NBCC-SS-002",
  "second_score": 45,
  "escalate": true,
  "trigger": "crisis_or_safety",
  "target": "NBCC-SS-005"
}
```

---

## Metrics (from `evals/routing_escalation_results.json` and `evals/golden_questions_results.json`)

- **Journey classification accuracy**: **10/10**
- **Escalation-trigger accuracy**: **10/10**
- **Escalation-target accuracy**: **1/1**
- **Retrieval top-1 accuracy**: **10/10** (was 9/10)
- **Retrieval top-3 accuracy**: **10/10** (unchanged)

---

## Known Limitations (Explicitly Not Fixed Here, Out of Scope)

1. **No stemming or word-form normalization.** Discovered during Phase A diagnosis:
   "I was sexually assaulted, who can I talk to?" only matches on "talk" (score 2)
   because "sexually"/"assaulted" don't match the corpus forms "sexual"/"assault". GQ-04's
   *exact* wording ("sexual violence or assault") already matches without stemming, so
   this was not required to satisfy Day 4's acceptance criterion, and stemming was
   explicitly excluded from this increment's scope per instruction. This remains a real
   gap for paraphrased or inflected real-world queries and is a candidate for a future,
   separately-scoped increment (with its own regression testing, since introducing
   stemming would touch every query, not just safety-related ones).
2. **Corpus-scaling limitation of the exclusive-term rule.** "Exclusive to exactly one
   document" is a binary, discrete signal that depends on the corpus staying small. As
   more curated sources are added (Day 5+ may expand the corpus), it becomes
   mechanically harder for any given term to remain unique to exactly one document, so
   the exclusive-term bonus will fire less often over time — not because safety-relevant
   language becomes less important, but purely as a function of corpus size. A future
   increment adding new curated sources should re-run the full golden-question evaluation
   (as this increment did) rather than assume the current multiplier and thresholds
   continue to hold, and should consider a graduated (non-binary) document-frequency
   weighting if the corpus grows meaningfully beyond 3–5 documents.
3. **GQ-02's underlying fragility was not fixed.** Confirmed during diagnosis: GQ-02
   currently resolves to the correct source only via generic terms ("nbcc", "resources"),
   not via its actual topical term ("anxious", which doesn't match "anxiety" without
   stemming). This increment's remedy does not touch or worsen this — GQ-02's score is
   completely unchanged before and after (verified) — but it also does not fix the
   underlying coincidence. Flagged here as a candidate for the same future stemming work
   noted above, not as a Day 4 regression.

---

## Confirmation: No Prohibited Scope Introduced

- No LLM, embedding model, or vector database.
- No new npm dependency (`package.json` untouched).
- No external system integration.
- No authentication, analytics, or real student data.
- No change to `lib/curated-sources.ts`, the curated source JSON files, `lib/routing.ts`,
  or `lib/escalation.ts`.
- No golden-question `expected_source_ids`, `expected_journey`, `expected_escalation`, or
  `expected_escalation_target_id` value was changed — only the obsolete `known_defect_note`
  narrative annotation on GQ-04 was removed, since the defect it described no longer
  exists.
- Footer stripping, uniform frequency caps, stemming, synonym expansion, and any
  GQ-04-specific keyword override were considered (two of them empirically tested and
  rejected, per above) and none were implemented.

---

## Files Changed

- `lib/retrieval.ts` (the document-frequency exclusive-term weighting fix)
- `tests/retrieval.test.ts` (5 new focused regression tests)
- `tests/routing.test.ts` (1-line fixture update: added the two new required
  `MatchedTerm` fields to a synthetic test fixture — a type-shape fix, not a behavior
  change)
- `tests/routing-escalation-golden-questions.test.ts` (2 tests updated from asserting the
  known-broken defect to asserting the corrected, verified-true behavior)
- `evals/golden_questions.json` (removed GQ-04's obsolete `known_defect_note`; no
  expected value changed)
- `evals/golden_questions_results.json` (regenerated from real execution)
- `evals/routing_escalation_results.json` (regenerated from real execution)
- `learning-log/DAY_04.md` (this file)
- `product/BACKLOG.md` (D2-FU-01 closed, Day 4 marked complete with evidence)
