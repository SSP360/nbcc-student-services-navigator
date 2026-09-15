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

- [x] D2-01 Curate 3–5 NBCC Student Services sources with provenance and readable text.
- [x] D2-02 Implement deterministic keyword-based retrieval over curated sources (no model).
- [x] D2-03 Add dev-only retrieval inspector (API + page) showing matches and reasons.
- [x] D2-04 Define ~10 golden questions with expected source IDs, grounded in curated text.
- [x] D2-05 Implement repeatable retrieval evaluation (tests + committed results snapshot).
- [x] D2-06 Record Day 2 learning, limitations (e.g., footer boilerplate noise), and next-step candidates.

## Day 2 — Follow-up Candidates (Not Started)

- [ ] D2-FU-01 Improve retrieval robustness by stripping footer boilerplate and/or reweighting generic terms (e.g., "support", "campus") for sensitive queries such as sexual-violence support.

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

## Day 3 — Policy-Driven Routing and Escalation (No Model)

- [ ] D3-01 Implement deterministic journey routing over retrieval results (academic_support, financial_support, accessibility_inclusion, wellbeing_safety, general_contact) with human-readable reasons.
- [ ] D3-02 Implement policy-driven escalation decisions (escalate / do not escalate, target service, reason) based on NBCC-style safety and support policies.
- [ ] D3-03 Extend golden questions dataset with expected journey labels and escalation decisions; add automated routing + escalation evaluation tests.
- [ ] D3-04 Add dev-only routing inspector (API + page) showing query → retrieval → journey → escalation, 404-gated in production.
- [ ] D3-05 Create and update learning-log/DAY_03.md with Day 3 decisions, evidence, limitations, and next-step candidates.
