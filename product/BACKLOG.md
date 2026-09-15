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

## Day 2 — D2 Epic (GitHub Issue #2): Curated Knowledge and Explainable Retrieval

- [x] D2-01 Curate three approved NBCC Student Services sources (GitHub Issue #3). Evidence: `knowledge/curated/`, `lib/curated-sources.ts`, `tests/curated-sources.test.ts`, `learning-log/DAY_02_D2-01.md`.
- [x] D2-02 Implement deterministic keyword retrieval across curated content. Evidence: `lib/retrieval.ts`, `tests/retrieval.test.ts`.
- [x] D2-03 Build a development-only retrieval-inspector experience explaining each match. Evidence: `app/dev/retrieval/page.tsx`, `app/api/dev/retrieval/route.ts`.
- [x] D2-04 Add approximately 10 golden questions with expected source IDs. Evidence: `evals/golden_questions.json`.
- [x] D2-05 Run and record repeatable evaluation results. Evidence: `tests/golden-questions.test.ts` (automated, repeatable via `npm test`), `evals/golden_questions_results.json` (committed snapshot with real scores).

Status: all items implemented, tested, and built successfully on branch `feat/d2-01-curate-sources`. Full detail in `learning-log/DAY_02.md`. Not yet merged to main; awaiting explicit product-owner acceptance per the Day 2 delivery rule in GitHub Issue #2.

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
