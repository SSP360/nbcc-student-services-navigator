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

## Day 4 — Retrieval Robustness and Journey Correction (Planned — unblocked, not started)

**Unblocked (2026-09-16)**: `product/REPOSITORY_DELIVERY_PROTOCOL.md`'s rule required no
new implementation branch to start until the Day 0 reconciliation pull request merged into
`main` and its post-merge checks ran from the resulting `main` SHA. Both are now confirmed
(PR #5 merged; post-merge `npm test`/`npm run build`/production-gating verified from `main`
SHA `be85fa7` — see `learning-log/DAY_00.md`). **Day 4 has not been started**: no branch
has been created and no implementation work has occurred. When it begins, it must branch
from this verified `main` SHA (`be85fa7`), not from any earlier or pre-Day-0 branch, to
avoid repeating the branch-drift finding this reconciliation exists to fix.

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

- [ ] D4-01 Analyse D2-FU-01 retrieval behaviour and footer boilerplate impact in detail (GQ-04 and at least 2–3 similar queries), and document a concrete retrieval-logic strategy (e.g., footer stripping, generic-term deweighting, or field-aware matching) in `learning-log/DAY_04.md`.
- [ ] D4-02 Implement retrieval robustness improvements in `lib/retrieval.ts` (and/or supporting helpers) to reduce footer boilerplate noise and make GQ-04 and similar queries match NBCC-SS-005 as their primary, wellbeing/safety source, without breaking existing Day 2 success cases.
- [ ] D4-03 Re-run retrieval, routing, and escalation evaluations (`tests/golden-questions.test.ts`, `tests/routing-escalation-golden-questions.test.ts`) and update `evals/golden_questions_results.json` and `evals/routing_escalation_results.json` to reflect the new, fully-green state (10/10 journey, 10/10 escalation-trigger, 1/1 escalation-target for GQ-04).
- [ ] D4-04 Update `learning-log/DAY_04.md` and `product/BACKLOG.md` to record the retrieval changes, evidence, and any residual limitations, and to mark D2-FU-01 as closed once GQ-04's journey test passes and journey accuracy reaches 10/10.
- [ ] D4-05 Run full `npm test` and `npm run build` as the Day 4 acceptance gate, confirming that all suites are green (no deliberate failing tests remain) and that production-mode dev routes remain correctly 404-gated.

## Day 5 — Service-Resolution Proof and Privacy-Safe Measurement Design (Planned)

### Day 5 Epic – Prove Service Resolution, Design Measurement Without Real Student Data

**Epic description**  
As NBCC and Lucentrix, we want evidence that a query genuinely resolves to the correct
human service end-to-end (retrieval → journey → escalation → named contact), and a design
for *measuring* that resolution over time — without ever collecting or requiring real
student data to do so. Measurement design, not measurement execution against real users,
is this day's deliverable.

**Epic acceptance criteria**

- A defined, reproducible method demonstrates, for each of the five journeys, that a
  representative query resolves to a named, correct human contact with full traceability
  (source → journey → escalation decision → contact).
- A privacy-safe measurement design exists (e.g., synthetic or anonymized query sets,
  aggregate-only metrics) that could, in principle, monitor resolution quality over time
  without collecting real student identities, free-text disclosures, or any personal data.
- The measurement design explicitly states what it does *not* do: no logging of real
  student queries, no persistent per-user tracking, no analytics against individuals.
- All five journeys are covered by the resolution proof, including the GQ-04 case (subject
  to Day 4's fix landing first).

### Day 5 Backlog Items

- [ ] D5-01 Define and document a "service-resolution proof" method: for each journey, a
      representative query, its full retrieval → journey → escalation trace, and the
      resulting named human contact, evidenced from the deterministic pipeline (no
      fabricated examples).
- [ ] D5-02 Design (not implement against real users) a privacy-safe measurement approach:
      what would be measured, using what synthetic or aggregate data, with an explicit
      statement of what is out of bounds (real student identities, free-text content
      retention, individual-level tracking).
- [ ] D5-03 Document how the existing `/dev/*` inspectors already provide the underlying
      evidence this measurement design would aggregate, without requiring new
      infrastructure to be built prematurely.
- [ ] D5-04 Record Day 5 evidence, the measurement design, and open questions in
      `learning-log/DAY_05.md`.

## Day 6 — Dual Learner/Staff Handoff Demonstration (Planned)

### Day 6 Epic – Demonstrate the Handoff From Both Sides

**Epic description**  
As NBCC and Lucentrix, we want to demonstrate the same escalation event from both
perspectives: what a learner experiences when a query is escalated, and what a staff
member would need to receive to act on that handoff. This proves the handoff is coherent
and complete without building a staff-facing product surface prematurely.

**Epic acceptance criteria**

- A demonstrable walkthrough shows a learner's query reaching an escalation decision and
  the resulting human-contact information they would see.
- A parallel walkthrough shows what a staff member at the named contact service would need
  to know to act on that same escalation (query context, trigger, journey, timestamp) —
  documented, not necessarily a built staff UI.
- The two walkthroughs are shown side by side so the handoff can be reviewed for
  completeness and safety by a non-technical stakeholder.
- No new personal data, authentication, or staff-facing product surface is built unless
  and until explicitly scoped as its own increment.

### Day 6 Backlog Items

- [ ] D6-01 Script and document a learner-side walkthrough for at least one query per
      journey, using the existing deterministic pipeline and dev inspectors as evidence.
- [ ] D6-02 Document the corresponding staff-side handoff view: what information the named
      contact service would need, derived only from the escalation decision's existing
      fields (trigger, journey, target service, reason) — no new data collection.
- [ ] D6-03 Produce a combined learner/staff demonstration script or view suitable for a
      non-technical audience, clearly labeled as a demonstration, not a live handoff
      integration.
- [ ] D6-04 Record Day 6 evidence, the dual-perspective walkthroughs, and limitations in
      `learning-log/DAY_06.md`.

## Day 7 — Design-Partner Readiness (Planned)

### Day 7 Epic – Ready for a Design-Partner Conversation

**Epic description**  
As NBCC and Lucentrix, we want the concept demonstrator, its evidence, and its governance
documentation to be ready for a design-partner conversation — a candid discussion with a
prospective institutional partner about what has been proven, what has not, and what a
pilot would require. This is not a production release and does not expand product scope.

**Epic acceptance criteria**

- A final governance audit confirms the Charter, Scope and policies remain intact: public
  sources only; no personal data, LLM, authentication, SIMS/Brightspace, case management,
  analytics, or public deployment.
- A clean, repeatable test/build/production-smoke run is recorded and fully green,
  including Day 4's GQ-04 fix.
- A concise design-partner-readiness pack explains purpose, boundaries, the
  service-resolution proof (Day 5), the learner/staff handoff demonstration (Day 6),
  evidence, known limitations, and explicit next-step options — framed as a conversation
  starter, not a sales claim.
- A reviewed, product-owner-approved baseline is merged to `main` and tagged only after
  final checks pass.

### Day 7 Backlog Items

- [ ] D7-01 Conduct a final scope and governance audit against `PRODUCT_CHARTER.md`,
      `SCOPE.md`, policies, and `AI_OPERATING_INSTRUCTIONS.md`.
- [ ] D7-02 Run final clean-install/reproducibility, `npm test`, `npm run build`, and
      production-mode smoke checks; confirm dev-only routes remain 404-gated.
- [ ] D7-03 Prepare a concise design-partner-readiness pack: purpose, boundaries, the Day 5
      resolution proof, the Day 6 handoff demonstration, evidence, known limitations, and
      next-step options.
- [ ] D7-04 Create a reviewed baseline through a PR merged to `main` and a version tag,
      only after all final checks are green and product-owner approval is recorded.
- [ ] D7-05 Record the final design-partner-readiness decision, evidence, open risks, and
      post-demo follow-up candidates in `learning-log/DAY_07.md`.

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
