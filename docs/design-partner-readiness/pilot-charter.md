# Bounded 90-Day Design-Partner Pilot Charter (Draft — Not Approved, Not Started)

**Status**: Concept demonstrator. **This charter has not been approved by any
institution and no pilot has begun.** It is a template for a bounded conversation, not a
commitment or a signed agreement. Every section below is a proposal to be negotiated,
narrowed, or rejected by a design partner and Lucentrix's own product owner before any
pilot could start.

## Proposed Objective

Validate, with a single willing design-partner institution, whether the deterministic
retrieval → journey → escalation approach demonstrated in this repository produces
correct, source-traceable, safely-escalated results on a small set of real (not
demonstration) student-services journeys — without introducing any of the capabilities
this project has deliberately deferred (see Exclusions).

## Candidate Service Journeys

All five canonical journeys now have curated evidence (the `accessibility_inclusion`/
`financial_support` content gap disclosed in Days 5–7 was closed in P0; see
`service-resolution-traces.md`):

- `academic_support`
- `wellbeing_safety`
- `general_contact`
- `accessibility_inclusion`
- `financial_support`

## Public or Approved Non-Sensitive Knowledge Boundary

Only publicly available institutional web content, or content the institution explicitly
approves for this purpose, following the exact curation and validation process already
used for `knowledge/curated/` (see `learning-log/DAY_02_D2-01.md`). No internal, sensitive,
or student-specific content of any kind.

## Explicit Exclusions (Non-Negotiable for This Initial Pilot)

- No real student data of any kind.
- No live system integration (SIMS, Brightspace, Microsoft, CRM, ticketing).
- No authentication or student login.
- No LLM, embedding model, or vector database.
- No live staff workflow, task assignment, or case management.
- No autonomous decisions of any kind — every escalation reaches a human, always.
- No public deployment — pilot runs in a controlled, non-production environment only.
- No analytics, cookies, or persistent tracking of individuals.

## Learner and Institutional Value Hypotheses (To Be Tested, Not Assumed)

- **Learner hypothesis**: a student asking a real student-services question receives a
  correctly-sourced answer or a correctly-escalated human referral faster than through
  the institution's current default channel.
- **Institutional hypothesis**: staff receiving escalations get a clearer, more
  consistent minimal context packet than an unstructured inbound question.

Neither hypothesis is assumed true. The pilot's success measures below exist to test them.

## Human Escalation Ownership

Every escalation must have a named, institution-designated human owner before the pilot
begins — not a generic inbox. This mirrors the existing design principle already
implemented (`lib/escalation.ts`'s hardcoded, journey-independent targets for
`crisis_or_safety` and `accommodation_request`): a real pilot must have the same property
for whichever journeys it covers.

## Content-Owner and Governance Roles

- **Content owner** (institution side): approves which public pages may be curated,
  reviews curated extractions for accuracy, and is the single point of contact for
  content corrections.
- **Governance reviewer** (both sides): reviews the [`governance-evidence-dossier.md`](governance-evidence-dossier.md)
  before pilot start and signs off that scope boundaries are being honored throughout.
- **Technical point of contact** (Lucentrix side): owns the deterministic pipeline code
  and test suite; any change to escalation triggers or targets during the pilot requires
  this role's review, per `product/REPOSITORY_DELIVERY_PROTOCOL.md`.

## Gates Before Any Pilot Start

- **Privacy gate**: institution's privacy office reviews `policies/DATA_POLICY.md` and
  this charter's exclusions and confirms no institutional policy is violated.
- **Security gate**: institution's IT/security reviews the deployment environment
  (must remain non-production, access-controlled).
- **Accessibility gate**: institution confirms the demonstration interface (if any
  learner-facing surface is built for the pilot) meets its own accessibility standard.
- **Language gate**: institution confirms whether English-only is acceptable for the
  pilot duration, or whether French content is a pilot precondition (this repository is
  English-only today; French is explicitly deferred per `product/SCOPE.md`).
- **Records-review gate**: institution's records/FOIPOP (or equivalent) office confirms
  the pilot creates no new record-retention obligation, consistent with "no query
  logging" above.

## Baseline Inputs Required From the Institution

- A small (e.g., 10–20) set of real, anonymized, representative student-services
  questions the institution already receives, for use as an expanded golden-question set
  — following the exact grounding methodology already used in `evals/golden_questions.json`
  (each question's expected answer traceable to a real source).
- Confirmation of the correct current human escalation contacts for each covered journey.

## Pilot Success Measures

- Retrieval and journey-classification accuracy on the expanded (institution-provided)
  question set reaches the same rigor standard already demonstrated on the current
  10-question set (10/10 top-1, or a clearly explained/documented shortfall — not a
  lowered bar).
- Every escalation reaches its named human owner, verified by that owner's own
  confirmation (not by the demonstrator claiming success).
- Zero pilot-duration incidents involving real student data, live integration, or
  autonomous decision-making (see Safety Stop Conditions).

## Safety Stop Conditions (Any One Halts the Pilot Immediately)

- Any real student personal data is observed in application logs, storage, or output.
- Any escalation fails to reach a human within the institution's own agreed response
  window.
- Any attempt (by anyone) to connect the pilot to a live production system, SIMS,
  Brightspace, or Microsoft integration.
- Any request to add authentication, an LLM, or autonomous decision-making mid-pilot —
  this requires a new charter, not a pilot-scope change.
- Any single verified safety-escalation failure (a crisis/safety query that does not
  correctly escalate) — halts immediately for root-cause review before any resumption.

## Scale, Revise, or Stop Decision Criteria

At the end of 90 days, one of three outcomes, decided jointly by the institution and
Lucentrix's product owner — none automatic:

- **Scale**: success measures met; propose a larger, separately-scoped pilot or narrow
  production consideration, itself requiring its own new charter and governance review.
- **Revise**: partial success; identify the specific gap (e.g., content coverage,
  escalation accuracy) and propose a narrower follow-up pilot addressing only that gap.
- **Stop**: hypotheses not supported, or a stop condition was triggered; document why and
  close out — a legitimate, complete outcome, not a failure requiring justification.

## No Real Student Data or Live Systems for the Initial Pilot

Restated for emphasis: this pilot, as chartered, uses **no real student data and no live
system integration** unless a future, separate, explicit scope decision — documented as a
`PRODUCT_CHARTER.md` amendment per its own Scope Amendment Process — approves a materially
different pilot design. This charter does not pre-authorize that expansion.
