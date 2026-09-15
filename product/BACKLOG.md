# Initial Backlog

## Day 1 — Required

- [ ] D1-01 Create private repository.
- [ ] D1-02 Add product charter.
- [ ] D1-03 Add scope and prohibited actions.
- [ ] D1-04 Add six user journeys.
- [ ] D1-05 Add initial source catalogue.
- [ ] D1-06 Add AI operating instructions.
- [ ] D1-07 Add prototype disclaimer.
- [ ] D1-08 Scaffold application.
- [ ] D1-09 Display application name and disclaimer.
- [ ] D1-10 Add health-check endpoint.
- [ ] D1-11 Retrieve and display one NBCC public page.
- [ ] D1-12 Record architecture and stack decisions.
- [ ] D1-13 Record Day 1 learning and unresolved questions.

## Day 1 — Optional

- [ ] D1-14 Extract clean content from three sources.
- [ ] D1-15 Implement basic keyword search.
- [ ] D1-16 Add first five golden questions.

## Day 2 — Retrieval and Evaluation (Completed)

- [x] D2-01 Curate 3–5 NBCC Student Services sources with provenance and readable text. Evidence: `knowledge/curated/`, `lib/curated-sources.ts`, `tests/curated-sources.test.ts`, `learning-log/DAY_02_D2-01.md`.
- [x] D2-02 Implement deterministic keyword-based retrieval over curated sources (no model). Evidence: `lib/retrieval.ts`, `tests/retrieval.test.ts`.
- [x] D2-03 Add dev-only retrieval inspector (API + page) showing matches and reasons. Evidence: `app/dev/retrieval/page.tsx`, `app/api/dev/retrieval/route.ts`.
- [x] D2-04 Define ~10 golden questions with expected source IDs, grounded in curated text. Evidence: `evals/golden_questions.json`.
- [x] D2-05 Implement repeatable retrieval evaluation (tests + committed results snapshot). Evidence: `tests/golden-questions.test.ts`, `evals/golden_questions_results.json`.
- [x] D2-06 Record Day 2 learning, limitations (e.g., footer boilerplate noise), and next-step candidates. Evidence: `learning-log/DAY_02.md`.

Status: all items implemented, tested, and built successfully on branch `feat/d2-01-curate-sources`, merged to `main`. Accepted by the product owner.

## Day 2 — Follow-up Candidates (Not Started)

- [ ] D2-FU-01 Improve retrieval robustness by stripping footer boilerplate and/or reweighting generic terms (e.g., "support", "campus") for sensitive queries such as sexual-violence support. **Known limitation observed in Day 2**: caused a top-1 near-miss on golden question GQ-04 (NBCC-SS-002 scored 45 vs. NBCC-SS-005's 44; NBCC-SS-005 still placed second, within top 3). Evidence: `evals/golden_questions_results.json` (GQ-04 entry), `learning-log/DAY_02.md`. **Day 3 update**: the same ranking issue now also surfaces as a journey-routing mislabel for GQ-04 (`lib/routing.ts` reports `academic_support` instead of `wellbeing_safety`, since journey routing uses the top-1 retrieval result). The escalation layer (`lib/escalation.ts`) compensates for this specific safety-critical case by routing crisis/safety disclosures to Wellness and Counselling directly, independent of journey — but other, non-crisis queries in an affected domain would not have that compensation. See `learning-log/DAY_03.md`. Still not started; explicitly excluded from Day 3.

## Explicitly deferred

- Embeddings and vector retrieval
- Language model integration
- French generation
- Authentication
- SIMS and Brightspace
- Student profiles
- Case management
- Analytics dashboard
- Public deployment

## Day 3 — Policy-Driven Routing and Escalation (No Model) (Implemented; corrections applied after first review, pending final acceptance)

- [x] D3-01 Implement deterministic journey routing over retrieval results (academic_support, financial_support, accessibility_inclusion, wellbeing_safety, general_contact) with human-readable reasons. Evidence: `lib/routing.ts`, `tests/routing.test.ts`.
- [x] D3-02 Implement policy-driven escalation decisions (escalate / do not escalate, target service, reason) based on **all 6** triggers in `policies/ESCALATION_POLICY.md`, including trigger 6 (Source Error). Evidence: `lib/escalation.ts`, `tests/escalation.test.ts`; Source Error verified end-to-end against the live server by deliberately corrupting a curated file, documented in `learning-log/DAY_03.md`.
- [x] D3-03 Extend golden questions dataset with expected journey labels and escalation decisions; add automated routing + escalation evaluation tests, reporting three separated metrics. Evidence: `evals/golden_questions.json` (additive fields), `tests/routing-escalation-golden-questions.test.ts`, `evals/routing_escalation_results.json`. **Honest result**: journey classification accuracy 9/10 (GQ-04 is a known, deliberately-preserved-failing case — see D2-FU-01 below), escalation-trigger accuracy 10/10, escalation-target accuracy 1/1.
- [x] D3-04 Add dev-only routing inspector (API + page) showing query → retrieval → journey → escalation, 404-gated in production. Evidence: `app/dev/routing/page.tsx`, `app/api/dev/routing/route.ts`; verified 404 under a real `NODE_ENV=production` build.
- [x] D3-05 Create and update learning-log/DAY_03.md with Day 3 decisions, evidence, limitations, and next-step candidates, including a full record of the product-owner review and corrections below. Evidence: `learning-log/DAY_03.md`.

**Product-owner review (first pass not accepted)**: two issues were found and corrected before final acceptance review. (1) GQ-04's `expected_journey` had been changed to match the system's current (incorrect) output rather than the product-intended value, invalidating the evaluation; restored to `wellbeing_safety` and the resulting test failure preserved as documented evidence. (2) Escalation trigger 6 (Source Error) had been declared out of scope without being genuinely ruled out; on reflection it was implementable within D3-02's existing architecture (the curated-corpus file load can throw) and was implemented, tested, and verified end-to-end. Full detail in `learning-log/DAY_03.md`.

During D3-02, a real safety-relevant bug was also found and fixed before commit: the `crisis_or_safety` escalation trigger initially resolved its target contact from the (retrieval-derived) journey, which could route a sexual-violence disclosure's escalation to the academic-coaching contact instead of Wellness and Counselling; fixed to always target NBCC-SS-005 for that trigger, independent of journey.

`npm test`: 1 known, documented failure (GQ-04 journey — see above) + 146 passing, out of 147 total. `npm run build`: passes. Not yet merged to main or pushed to origin; awaiting explicit product-owner acceptance.
