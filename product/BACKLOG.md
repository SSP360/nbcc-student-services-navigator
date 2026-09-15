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

- [ ] D2-FU-01 **(Day 4 priority — see Day 3 acceptance note below)** Improve retrieval robustness by stripping footer boilerplate and/or reweighting generic terms (e.g., "support", "campus") for sensitive queries such as sexual-violence support. **Known limitation observed in Day 2**: caused a top-1 near-miss on golden question GQ-04 (NBCC-SS-002 scored 45 vs. NBCC-SS-005's 44; NBCC-SS-005 still placed second, within top 3). Evidence: `evals/golden_questions_results.json` (GQ-04 entry), `learning-log/DAY_02.md`. **Day 3 update**: the same ranking issue now also surfaces as a journey-routing mislabel for GQ-04 (`lib/routing.ts` reports `academic_support` instead of `wellbeing_safety`, since journey routing uses the top-1 retrieval result). The escalation layer (`lib/escalation.ts`) compensates for this specific safety-critical case by routing crisis/safety disclosures to Wellness and Counselling directly, independent of journey — but other, non-crisis queries in an affected domain would not have that compensation. See `learning-log/DAY_03.md`. **Acceptance criterion for closing this item**: `tests/routing-escalation-golden-questions.test.ts`'s GQ-04 journey assertion (`expected_journey: "wellbeing_safety"`) passes, and the aggregate journey-classification-accuracy metric in `evals/routing_escalation_results.json` reaches 10/10. Still not started; explicitly excluded from Day 3; designated the priority item for Day 4.

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

## Day 3 — Policy-Driven Routing and Escalation (No Model) (Accepted)

- [x] D3-01 Implement deterministic journey routing over retrieval results (academic_support, financial_support, accessibility_inclusion, wellbeing_safety, general_contact) with human-readable reasons. Evidence: `lib/routing.ts`, `tests/routing.test.ts`.
- [x] D3-02 Implement policy-driven escalation decisions (escalate / do not escalate, target service, reason) based on **all 6** triggers in `policies/ESCALATION_POLICY.md`, including trigger 6 (Source Error). Evidence: `lib/escalation.ts`, `tests/escalation.test.ts`; Source Error verified end-to-end against the live server by deliberately corrupting a curated file, documented in `learning-log/DAY_03.md`.
- [x] D3-03 Extend golden questions dataset with expected journey labels and escalation decisions; add automated routing + escalation evaluation tests, reporting three separated metrics. Evidence: `evals/golden_questions.json` (additive fields), `tests/routing-escalation-golden-questions.test.ts`, `evals/routing_escalation_results.json`. **Honest result**: journey classification accuracy 9/10 (GQ-04 is a known, deliberately-preserved-failing case — see D2-FU-01 below), escalation-trigger accuracy 10/10, escalation-target accuracy 1/1.
- [x] D3-04 Add dev-only routing inspector (API + page) showing query → retrieval → journey → escalation, 404-gated in production. Evidence: `app/dev/routing/page.tsx`, `app/api/dev/routing/route.ts`; verified 404 under a real `NODE_ENV=production` build.
- [x] D3-05 Create and update learning-log/DAY_03.md with Day 3 decisions, evidence, limitations, and next-step candidates, including a full record of the product-owner review and corrections below. Evidence: `learning-log/DAY_03.md`.

**Product-owner review (first pass not accepted)**: two issues were found and corrected before final acceptance review. (1) GQ-04's `expected_journey` had been changed to match the system's current (incorrect) output rather than the product-intended value, invalidating the evaluation; restored to `wellbeing_safety` and the resulting test failure preserved as documented evidence. (2) Escalation trigger 6 (Source Error) had been declared out of scope without being genuinely ruled out; on reflection it was implementable within D3-02's existing architecture (the curated-corpus file load can throw) and was implemented, tested, and verified end-to-end. Full detail in `learning-log/DAY_03.md`.

During D3-02, a real safety-relevant bug was also found and fixed before commit: the `crisis_or_safety` escalation trigger initially resolved its target contact from the (retrieval-derived) journey, which could route a sexual-violence disclosure's escalation to the academic-coaching contact instead of Wellness and Counselling; fixed to always target NBCC-SS-005 for that trigger, independent of journey.

`npm test`: 1 known, documented failure (GQ-04 journey — see above) + 146 passing, out of 147 total. `npm run build`: passes.

**Day 3 Acceptance Note (product owner, 2026-09-16)**: Day 3 – Policy-Driven Routing and Escalation (No Model) is accepted functionally.

- Deterministic journey routing and policy-driven escalation are implemented and tested over the existing Day 2 retrieval layer, with all six escalation triggers (including Source Error) covered.
- Crisis and safety-related queries (including the sexual-violence golden question) are consistently escalated to Wellness and Counselling (NBCC-SS-005), independent of retrieval ranking or journey label.
- One known defect remains: the GQ-04 sexual-violence query is currently classified into `academic_support` instead of the product-intended `wellbeing_safety` journey, due to the unresolved D2-FU-01 retrieval robustness limitation. This defect is deliberately preserved as a failing journey-classification test and recorded as a dependency on D2-FU-01, not hidden or downgraded.
- Day 4 (or the next increment) will focus on D2-FU-01: improving retrieval robustness (e.g., footer stripping / generic-term reweighting) and bringing GQ-04's journey classification to green, so that retrieval, routing, escalation and analytics all reflect the same safety-correct story.

**Decision**: Proceed with Day 3 as a completed functional increment with one documented, tracked defect linked to D2-FU-01. Day 4 backlog explicitly includes "Fix D2-FU-01 and correct GQ-04 journey to `wellbeing_safety`" as a priority item (see above).

Branch `feat/day-03-routing` pushed to origin for independent review after this acceptance. Not merged to `main`; merge remains the product owner's decision.

## Day 4 — Retrieval Robustness and Journey Correction (Planned)

### Day 4 Epic – Fix D2-FU-01 and Bring GQ-04 Journey to Green

**Epic title**  
Day 4 – Retrieval Robustness and Safety-Correct Journeys (No Model)

**Epic description**  
As NBCC and Lucentrix, we want the Student Services Navigator to fix the known retrieval robustness limitation (D2-FU-01) so that sensitive queries like GQ-04 are retrieved and classified into the correct wellbeing/safety journey, without changing our no-model, deterministic architecture. This ensures that retrieval, journey routing, escalation, and any future analytics all tell the same safety-correct story.

**Epic acceptance criteria**

- GQ-04's retrieval results reliably surface NBCC-SS-005 (Wellness and Counselling) as the top-1 match (or equivalent clear signal), without relying on brittle footer boilerplate or overly generic terms.
- `tests/routing-escalation-golden-questions.test.ts`'s GQ-04 journey assertion passes with `expected_journey: "wellbeing_safety"`.
- The aggregate journey-classification accuracy metric in `evals/routing_escalation_results.json` is updated to 10/10, with the GQ-04 defect note removed.
- No new safety regressions are introduced for other golden questions (all Day 2 and Day 3 tests remain green).
- No language model, embeddings, or external student systems are added; this remains a deterministic retrieval-logic improvement.

### Day 4 Backlog Items

- [ ] D4-01 Analyse D2-FU-01 retrieval behaviour and footer boilerplate impact in detail (GQ-04 and at least 2–3 similar queries), and document a concrete retrieval-logic strategy (e.g., footer stripping, generic-term deweighting, or field-aware matching) in `learning-log/DAY_04.md`.
- [ ] D4-02 Implement retrieval robustness improvements in `lib/retrieval.ts` (and/or supporting helpers) to reduce footer boilerplate noise and make GQ-04 and similar queries match NBCC-SS-005 as their primary, wellbeing/safety source, without breaking existing Day 2 success cases.
- [ ] D4-03 Re-run retrieval, routing, and escalation evaluations (`tests/golden-questions.test.ts`, `tests/routing-escalation-golden-questions.test.ts`) and update `evals/golden_questions_results.json` and `evals/routing_escalation_results.json` to reflect the new, fully-green state (10/10 journey, 10/10 escalation-trigger, 1/1 escalation-target for GQ-04).
- [ ] D4-04 Update `learning-log/DAY_04.md` and `product/BACKLOG.md` to record the retrieval changes, evidence, and any residual limitations, and to mark D2-FU-01 as closed once GQ-04's journey test passes and journey accuracy reaches 10/10.
- [ ] D4-05 Run full `npm test` and `npm run build` as the Day 4 acceptance gate, confirming that all suites are green (no deliberate failing tests remain) and that production-mode dev routes remain correctly 404-gated.

## Day 5 — Student-Facing Guided Experience (Planned)

### Day 5 Epic – Safe Deterministic Student Guidance

**Epic description**  
As NBCC and Lucentrix, we want a student-facing guided experience built on the validated deterministic retrieval, routing and escalation foundation. It must remain clearly labelled as a concept demonstrator, use public information only, cite its sources, provide clear next steps, and hand sensitive or uncertain cases to humans rather than making advice or eligibility decisions.

**Epic acceptance criteria**

- A student can enter a question and receive source-grounded information, a clear next step and relevant human contact guidance.
- The student-facing response is derived only from existing public curated content plus deterministic retrieval/routing/escalation output; no LLM-generated answer is introduced.
- Sensitive, accommodation, personalized-decision, urgent, unmatched and source-error conditions present a safe human-escalation path rather than unsupported advice.
- Source title, link and provenance remain visible; the prototype disclaimer remains prominent.
- The existing `/dev/*` inspector routes remain unavailable in production and are not exposed as student UI.

### Day 5 Backlog Items

- [ ] D5-01 Define the student-facing interaction and safety copy: prototype disclaimer, source-grounded response framing, clear next-step language, and explicit human-support handoffs.
- [ ] D5-02 Implement a deterministic query-to-guidance flow using existing retrieval, journey routing and escalation outputs; no LLM-generated answers, personal data, authentication, or external-system integration.
- [ ] D5-03 Render retrieved NBCC sources with titles, links, provenance and short extractive/retrieval-grounded guidance; do not invent policy or eligibility advice.
- [ ] D5-04 Surface escalation and human-contact guidance safely for sensitive, accommodation, urgent, unmatched and source-error conditions; never expose development diagnostics in the student experience.
- [ ] D5-05 Add UI and integration tests, complete a build and production-gating check, and document Day 5 evidence and limitations in `learning-log/DAY_05.md`.

## Day 6 — Demonstration Quality, Accessibility and Evidence (Planned)

### Day 6 Epic – Demonstration Quality and Evidence

**Epic description**  
As NBCC and Lucentrix, we want the concept demonstrator to be easy to understand, accessible, stable and evidence-led in a client meeting. The objective is to demonstrate what the system does and does not do honestly—not to simulate a production service.

**Epic acceptance criteria**

- The student-facing experience passes a focused keyboard, semantic, contrast and small-screen review, with material issues fixed or documented.
- A repeatable scenario set demonstrates all five journeys and the main escalation behaviours with public-source or policy evidence.
- The demo has an audience-appropriate explanation of source provenance, deterministic logic, safety guardrails and known limitations.
- Regression results are recorded truthfully before the demo.

### Day 6 Backlog Items

- [ ] D6-01 Perform a focused accessibility and responsive-use review of the student-facing flow; remedy material keyboard, semantic, contrast and small-screen issues within the existing stack.
- [ ] D6-02 Curate a demo-ready scenario set spanning academic support, financial support, accessibility/accommodation, wellbeing/safety, urgent/unmatched and source-error behaviours; every scenario must map to public source evidence or a documented escalation policy trigger.
- [ ] D6-03 Create a repeatable demo evidence view or runbook showing query, retrieved source(s), journey, escalation decision, target human service and limits of the prototype; keep developer inspection routes development-only.
- [ ] D6-04 Complete a regression pass across golden questions, routing/escalation policy tests and student-facing integration tests; record results and any unresolved limitations truthfully.
- [ ] D6-05 Document Day 6 learning, demo-readiness risks and exact pre-demo checks in `learning-log/DAY_06.md`.

## Day 7 — Client Demo Readiness and Release Baseline (Planned)

### Day 7 Epic – Controlled Client Demonstration Baseline

**Epic description**  
As NBCC and Lucentrix, we want a controlled, reviewable demonstration baseline that proves the concept is safe to show and reproducible. This is not a public production release and does not expand the product’s scope.

**Epic acceptance criteria**

- A final governance audit confirms the Charter, Scope and policies remain intact: public sources only; no personal data, LLM, authentication, SIMS/Brightspace, case management, analytics or public deployment.
- A clean, repeatable test/build/production-smoke run is recorded and fully green.
- A concise demo pack explains purpose, boundaries, scenarios, safety/escalation, evidence, known limitations and future options.
- A reviewed, product-owner-approved baseline is merged to `main` and tagged or released only after final checks pass.

### Day 7 Backlog Items

- [ ] D7-01 Conduct a final scope and governance audit against `PRODUCT_CHARTER.md`, `SCOPE.md`, policies and `AI_OPERATING_INSTRUCTIONS.md`; confirm no personal data, LLM, authentication, SIMS/Brightspace integration, analytics or public deployment has entered scope.
- [ ] D7-02 Run final clean-install/reproducibility, `npm test`, `npm run build` and production-mode smoke checks; confirm dev-only routes are 404-gated and public health behaviour remains correct.
- [ ] D7-03 Prepare concise client-demo collateral: purpose, public-source boundaries, safety/escalation behaviour, scenario script, evidence of deterministic evaluation, known limitations and explicit next-step options.
- [ ] D7-04 Create a demo baseline through a reviewed PR merged to `main` and a version tag or GitHub release only after all final checks are green and product-owner approval is recorded.
- [ ] D7-05 Record final demo-readiness decision, evidence, open risks and post-demo follow-up candidates in `learning-log/DAY_07.md`.

## Seven-Day Delivery Map

- **Day 1:** Foundation, governance, source catalogue and app shell.
- **Day 2:** Curated deterministic retrieval and golden-question evaluation.
- **Day 3:** Deterministic journey routing and policy-driven escalation.
- **Day 4:** Retrieval robustness; close D2-FU-01 and restore a green evaluation suite.
- **Day 5:** Safe student-facing guided experience over the validated deterministic foundation.
- **Day 6:** Accessibility, demo quality, scenarios and evidence.
- **Day 7:** Final governance/testing gate, demo collateral and controlled baseline.

All Day 5–Day 7 work remains subject to the existing product charter and scope boundaries. Any expansion beyond the listed items requires a documented scope amendment and product-owner approval.
