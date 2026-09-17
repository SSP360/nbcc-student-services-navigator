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

- [x] D2-FU-01 **(Closed, Day 4)** Improve retrieval robustness for sensitive queries such as sexual-violence support. **Original limitation (Day 2)**: caused a top-1 near-miss on golden question GQ-04 (NBCC-SS-002 scored 45 vs. NBCC-SS-005's 44). **Resolved (2026-09-16)** on branch `feat/day-04-retrieval-robustness` via a document-frequency exclusive-term weighting fix in `lib/retrieval.ts` (a query term occurring in exactly one curated document's body receives a deterministic 3× weight on its body contribution) — not footer stripping, which was diagnosed and confirmed score-neutral for this case. GQ-04 now scores NBCC-SS-005 at 60 vs. NBCC-SS-002 at 45 (margin 15, up from a 1-point gap with the wrong winner). Evidence: `learning-log/DAY_04.md` (root cause, rejected alternatives, before/after scores), `tests/retrieval.test.ts` (focused regression tests), `evals/golden_questions_results.json` and `evals/routing_escalation_results.json` (regenerated from real execution: journey classification 10/10, escalation-trigger 10/10, escalation-target 1/1, retrieval top-1 10/10).

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

## Day 0 — Repository Reconciliation and Delivery Hygiene (Merged / accepted on main)

**Why this exists**: verified inspection (`git log`, `gh pr view 4`, direct `git diff`
against `main`) found that Day 3's product-owner acceptance and its actual integration
into `main` were, for a period, two different facts. Pull Request #4 has since merged
(`merged:true`, resulting `main` SHA `036d2fe`), confirmed by direct inspection — but two
further commits adding Day 4 and Days 5–7 backlog content were pushed to the
already-merged `feat/day-03-routing` branch afterward and never reached `main`. Full
detail: `product/REPOSITORY_DELIVERY_PROTOCOL.md` and `product/RECONCILIATION_CHECKLIST.md`.

- [x] D0-01 Reconcile the accepted Day 3 implementation into `main`. **Acceptance criteria,
      each verified independently, not assumed**:
      - PR #4 (`feat/day-03-routing` → `main`) reports `merged:true` — **confirmed**.
      - Resulting `main` SHA is recorded — **`036d2fed5b94e5c5fb08f50284478a5716fff0ba`**.
      - `npm test` and `npm run build` run *from that `main` SHA* (not the branch) —
        **confirmed**: 1 failed / 146 passed / 147 total; build passes; production-mode
        gating confirms `/api/dev/sources`, `/api/dev/retrieval`, `/api/dev/routing` all
        return 404 and `/api/health` returns 200.
      - The GQ-04 defect is recorded honestly, not concealed — **confirmed**, see below.
      - Backlog and roadmap content that had drifted onto the (already-merged) feature
        branch is brought onto `main` via this Day 0 reconciliation pull request.
- [x] D0-02 Adopt `product/REPOSITORY_DELIVERY_PROTOCOL.md` and
      `product/RECONCILIATION_CHECKLIST.md` as the standing process for every future
      increment. **Closed**: PR #5 ("Day 0: Repository reconciliation and delivery
      hygiene") is merged into `main`.

**Post-merge reconciliation verification (2026-09-16)**: PR #5 confirmed merged.
`git fetch origin && git switch main && git pull --ff-only origin main` fast-forwarded
cleanly to SHA **`be85fa7b934b037d77ae83737e7136bd9b95c7b4`**. From that SHA, a clean
install (`rm -rf node_modules .next && npm ci`) followed by `npm test` reported
**1 failed / 146 passed / 147 total** — the sole failure is the known GQ-04
journey-classification case (`expected_journey: "wellbeing_safety"`,
actual `"academic_support"`), confirmed unchanged and undisguised;
`npm run build` passed, generating all 10 routes; production-mode gating confirmed
`/api/dev/sources`, `/api/dev/retrieval`, and `/api/dev/routing` all return 404 and
`/api/health` returns 200. Full detail: `learning-log/DAY_00.md`.

**Day 0 status: Merged / accepted on main.** All four completion criteria in
`product/RECONCILIATION_CHECKLIST.md` are satisfied (PR merged, `merged:true` confirmed,
`main` SHA recorded, post-merge checks run from that SHA).

## Day 3 — Policy-Driven Routing and Escalation (No Model) (Merged / accepted on main)

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

**Integration status (corrected during Day 0 reconciliation)**: Pull Request #4
(`feat/day-03-routing` → `main`) was subsequently opened, reviewed, and merged.
`gh pr view 4` confirms `merged:true`; `main` at SHA `036d2fed5b94e5c5fb08f50284478a5716fff0ba`
contains this Day 3 work, verified by direct file inspection and by running `npm test` /
`npm run build` from that SHA (see Day 0 above). Per
`product/REPOSITORY_DELIVERY_PROTOCOL.md`'s approved status vocabulary, this item's status
is **"Merged / accepted on main,"** not "pending merge" — that earlier status is now stale
and is corrected here rather than left standing.

## Day 4 — Retrieval Robustness and Journey Correction (Complete — implemented on branch, pending merge)

**Unblocked (2026-09-16)**: `product/REPOSITORY_DELIVERY_PROTOCOL.md`'s rule required no
new implementation branch to start until the Day 0 reconciliation pull request merged into
`main` and its post-merge checks ran from the resulting `main` SHA. Both were confirmed
(PR #5 merged; post-merge `npm test`/`npm run build`/production-gating verified from `main`
SHA `be85fa7` — see `learning-log/DAY_00.md`) before Day 4 began.

**Complete (2026-09-16)** on branch `feat/day-04-retrieval-robustness`, based on `main` @
`425c7026f27870553b5d90c3e764d5d007969ede`. D2-FU-01 is closed (see above); GQ-04's
journey classification is now `wellbeing_safety`, matching the intended value, with
journey classification, escalation-trigger, and escalation-target accuracy all at their
required levels. Full detail: `learning-log/DAY_04.md`. Per
`product/REPOSITORY_DELIVERY_PROTOCOL.md`, this item's status is "Implemented on branch,"
not "Merged / accepted on main," until a pull request merges and post-merge checks are
run from `main` — this branch has not been merged.

**Narrow scope, restated as the closing definition of done for D2-FU-01**: this item is
strictly a retrieval-quality fix. Its definition of done is `tests/routing-escalation-golden-questions.test.ts`'s
GQ-04 journey assertion passing with `expected_journey: "wellbeing_safety"`, and journey
classification accuracy in `evals/routing_escalation_results.json` reaching 10/10 —
**without changing any other expected evaluation result** (`expected_source_ids`,
`expected_escalation`, `expected_escalation_target_id`, or any other golden question's
expectation). No model, embedding, or scope expansion is introduced to achieve this.

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

- [x] D4-01 Analysed D2-FU-01 retrieval behaviour in detail against the real engine (GQ-04 plus 3 nearby variants), and documented the diagnosed root cause (domain-substring false positive + no discriminating-power weighting) and two rejected alternatives (uniform frequency cap, "full domain phrase" match — both empirically tested and shown to regress GQ-02/GQ-10) in `learning-log/DAY_04.md`. Footer boilerplate was diagnosed and confirmed score-neutral, not the actual cause.
- [x] D4-02 Implemented a document-frequency exclusive-term weighting fix in `lib/retrieval.ts`: a query term occurring in exactly one curated document's body receives a deterministic 3× multiplier on its body-match contribution. GQ-04 now matches NBCC-SS-005 as its primary result (score 60 vs. 45), with no other golden question's classification, ranking, or escalation behaviour changed.
- [x] D4-03 Re-ran retrieval, routing, and escalation evaluations and updated `evals/golden_questions_results.json` and `evals/routing_escalation_results.json` from real execution: 10/10 journey, 10/10 escalation-trigger, 1/1 escalation-target, 10/10 retrieval top-1 (up from 9/10).
- [x] D4-04 Updated `learning-log/DAY_04.md` and `product/BACKLOG.md`; D2-FU-01 marked closed above.
- [x] D4-05 Ran full `npm test` (152/152 passing, no deliberately failing test remains) and `npm run build` (passed, 10 routes) as the Day 4 acceptance gate; confirmed production-mode dev routes (`/api/dev/sources`, `/api/dev/retrieval`, `/api/dev/routing`) remain 404-gated and `/api/health` returns 200.

## Days 5–7 — Service Resolution and Design-Partner Readiness (Complete — implemented on branch, pending merge)

Executed as **one combined increment** (not three sequential days), per direct
product-owner instruction, on branch `feat/d5-d7-service-resolution-readiness`, base
`main` @ `3c7f3e5d5bdf517411a64f4988ccde884fe06b3b`. Full detail, evidence, and validation
results: `learning-log/DAY_05_07.md`. Per `product/REPOSITORY_DELIVERY_PROTOCOL.md`, this
item's status is "Implemented on branch," not "Merged / accepted on main," until a pull
request merges and post-merge checks are run from `main`.

**Epic acceptance criteria — all met, evidence-based, not narrative claims**:

- Five service-resolution traces created, one per canonical journey, using real
  deterministic-pipeline output (not fabricated results). Three journeys
  (`academic_support`, `wellbeing_safety`, `general_contact`) are demonstrated end-to-end
  correctly. Two (`accessibility_inclusion`, `financial_support`) have a disclosed,
  honestly-documented content-coverage gap — 2 of 7 approved sources
  (`NBCC-SS-004`, `NBCC-SS-006`) are not yet curated — with routing-logic correctness
  proven separately by existing unit tests. See `docs/design-partner-readiness/service-resolution-traces.md`.
- A privacy-safe measurement design defines what a future pilot could measure and
  explicitly states what is not collected or implemented now. See
  `docs/design-partner-readiness/measurement-design.md`.
- A dual learner/staff handoff demonstration, using the corrected GQ-04 scenario, shows a
  coherent handoff with a clearly labeled "demonstration-only handoff packet — not a live
  case-management record." See `docs/design-partner-readiness/dual-perspective-demo.md`.
- A governance/evidence dossier, executive narrative, baseline/value worksheet
  (distinguishing cash savings, capacity release, cost avoidance, and retention
  hypotheses without asserting any of them), and a draft, unapproved 90-day pilot charter
  were produced. See `docs/design-partner-readiness/`.
- No LLM, embeddings, vector database, new dependency, external integration,
  authentication, analytics, real student data, or live workflow was introduced.
  `lib/`, `app/`, `knowledge/curated/`, `policies/`, and `package.json` are all
  unmodified — this increment is documentation only, verified with `git diff --stat`.
- Full test suite (152/152), build, and production-mode gating re-verified from this
  branch (see `learning-log/DAY_05_07.md`).

## Content Coverage Follow-Up (Closed by P0)

- [x] D-FUTURE-01 Curate `NBCC-SS-004` (Accessibility and Inclusion Services) and
      `NBCC-SS-006` (Student Loans) into `knowledge/curated/`, following the exact
      process already used for NBCC-SS-001/002/005 (`learning-log/DAY_02_D2-01.md`).
      **Closed in P0** (`learning-log/P0_COVERAGE_UX.md`): both sources curated from
      live approved pages; `accessibility_inclusion` and `financial_support` now resolve
      correctly end-to-end (previously only their routing logic was proven correct).
      `docs/design-partner-readiness/service-resolution-traces.md` Traces 4–5 updated
      accordingly. All five canonical journeys are now at the same evidentiary standard.

## P0 — Five-Journey Coverage and Learner Service-Resolution UX (Complete)

Closes D-FUTURE-01 and replaces the Day 1 concept-shell homepage with a working learner
experience over the real pipeline. See `learning-log/P0_COVERAGE_UX.md` for full evidence.

- [x] Curated `NBCC-SS-004` and `NBCC-SS-006` from live approved public sources.
- [x] Hardened `lib/escalation.ts`'s `personalized_decision` trigger so a financially-
      framed decision query always reaches the named financial contact (NBCC-SS-007),
      independent of a possibly-wrong retrieval-derived journey — matching the existing
      hardcoded-safe pattern for `crisis_or_safety` and `accommodation_request`.
- [x] Added GQ-11 (accessibility) and GQ-12 (financial_support) to
      `evals/golden_questions.json`; all 12 golden questions pass retrieval, journey
      classification, and escalation-trigger; both escalating questions
      (GQ-04, GQ-11) pass escalation-target.
- [x] Replaced `app/page.tsx`'s concept shell with a learner UX calling a new
      production-safe endpoint, `GET /api/navigate` (`app/api/navigate/route.ts`), which
      wraps the real deterministic pipeline in a plain-language, learner-safe response
      shape (`lib/navigate.ts`) — no raw scores or matched-term detail, unlike the
      development-only `/api/dev/routing`.
- [x] 177/177 tests pass (165 pre-existing + 12 new); `npm run build` passes (11 routes);
      production-mode gating re-verified (`/dev/*` and `/api/dev/*` 404, `/api/health`
      and `/` and `/api/navigate` 200).
- [x] No LLM, embedding, model, new npm dependency, external integration, authentication,
      or real student data was introduced.

## Post-Demo Discovery — Not Product Scope Until Validated

The following are discovery and validation activities, not backlog items with code
deliverables. None of them authorizes any product or engineering work by themselves; each
would need its own explicitly scoped backlog item, created only after the activity below
produces a validated reason to do so.

- **Discovery interviews**: structured conversations with NBCC stakeholders (and, if
  appropriate, comparable institutions) to test whether the demonstrated journeys and
  escalation behaviour match real staff and student workflows.
- **Competitive / procurement scan**: understanding how comparable institutions currently
  handle student-services navigation and what a procurement process for something like
  this would actually require.
- **Pilot charter**: if discovery supports it, a written charter defining a bounded pilot's
  scope, duration, success criteria, and — critically — what stays out of scope (real
  student data, live integrations) for the pilot's duration.
- **Value-model validation**: testing, with real stakeholders, whether the assumed value
  (faster resolution, reduced staff load, improved consistency) is actually the value they
  care about, before building anything to prove it quantitatively.
- **Go/no-go decision**: an explicit, documented decision point — informed by the above —
  on whether to proceed to a pilot at all. "No" is a legitimate and complete outcome of
  this section.

## Deferred Horizon (Beyond Design-Partner Readiness — Not Scoped, Not Approved)

These remain explicitly out of scope for every day of this roadmap, including Days 5–7 and
any post-demo discovery. Moving any of them into scope requires a documented
`PRODUCT_CHARTER.md` amendment and explicit product-owner approval — never an incremental
drift into scope through an unrelated increment.

- Real student data of any kind.
- Any external system *write* (SIMS, Brightspace, Microsoft, or otherwise) — read-only
  integration, if ever considered, is a separate, later decision.
- Autonomous high-stakes decisions (academic, financial, health, accessibility, or
  disciplinary outcomes made without a human).
- A broad employee copilot spanning tasks beyond student-services navigation.
- A generic, undifferentiated LLM chatbot — this project's value is the deterministic,
  evidence-linked pipeline, not a conversational interface.
- Institution-wide AI claims or branding implying broader validation than this
  demonstrator has actually undergone.
- Unsupported P&L, cost-savings, or retention claims — no financial or retention outcome
  may be asserted without a validated, cited measurement basis.

## Seven-Day Delivery Map

- **Day 1:** Foundation, governance, source catalogue and app shell.
- **Day 2:** Curated deterministic retrieval and golden-question evaluation.
- **Day 3:** Deterministic journey routing and policy-driven escalation.
- **Day 4:** Retrieval robustness; close D2-FU-01 and restore a green evaluation suite.
- **Day 5:** Service-resolution proof and privacy-safe measurement design.
- **Day 6:** Dual learner/staff handoff demonstration.
- **Day 7:** Design-partner readiness.

All Day 5–Day 7 work remains subject to the existing product charter and scope boundaries. Any expansion beyond the listed items — including anything in Post-Demo Discovery or the Deferred Horizon above — requires a documented scope amendment and product-owner approval.
