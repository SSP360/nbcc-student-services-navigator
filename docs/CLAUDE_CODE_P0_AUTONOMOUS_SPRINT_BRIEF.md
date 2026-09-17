# Claude Code P0 Autonomous Sprint Brief

## Authority and stopping rules

You are the delivery lead for the NBCC Student Services Navigator.

Run an autonomous, repository-contained sprint. You are authorised to inspect code, create worktrees and branches, edit files, run commands, commit changes, push branches, create draft pull requests, request and perform automated reviews, and resolve review findings within the scope below.

You must not merge to `main`, deploy, alter secrets/credentials, change CI permissions, add paid services, add external integrations, add user accounts, collect analytics, persist learner data, introduce an LLM, or make institutional policy/content decisions not already approved. Escalate only if a blocking decision cannot be resolved from repository context.

Do not ask the product owner for routine approval during the sprint. Work autonomously until you either reach demonstrable readiness or encounter a genuine hard blocker.

## Independent acceptance contract

`docs/RESOLUTION_READY_ACCEPTANCE_MATRIX.md` is the release contract and `evals/resolution-acceptance-cases.ts` is its versioned executable fixture.

You may add clarifying coverage, but you must not delete, weaken, reinterpret, or change required outcomes in either artifact to make implementation pass.

If a change to a required outcome appears necessary:

1. Record it in `docs/P0_DECISIONS_REQUIRING_OWNER.md`.
2. State the rationale, options, impact, and recommended decision.
3. Mark the affected acceptance IDs as `BLOCKED` in the final report.
4. Do not silently modify the contract.

A claim that a feature was implemented is not acceptance evidence. The final report must map every acceptance ID to `PASS`, `FAIL`, `BLOCKED`, or `NOT APPLICABLE`, with the exact supporting test, command, manual-test record, code path, branch, and commit SHA.

## Product objective

Create a resolution-first student-services navigator.

Students must be able to choose a visible need or describe it in plain language. When evidence is strong, they receive a specific, safe, actionable route. When evidence is weak, ambiguous, unsupported, sensitive, or unsafe, they receive an honest, safe recovery path or human-assisted route.

This is not a contact-deflection product. Correct human assistance is a successful outcome.

## Non-negotiable rules

- No LLM or generative-AI integration.
- Do not collect, persist, log, or require learner personal information.
- Do not create accounts, profiles, conversation history, or individual analytics.
- Do not provide autonomous decisions about eligibility, funding, accommodation, health, safety, legal matters, discipline, or personal cases.
- Safety escalation overrides retrieval, confidence assessment, clarification, and normal navigation.
- Do not claim to resolve a student’s underlying case; provide safe information, routing, and human handoff only.
- Only approved active institutional sources may support a confident route.
- Never introduce web-scraped, invented, inferred, or unapproved service sources.
- Retired or unavailable sources must never be returned as confident recommendations.
- Never present a weak lexical match as a confident recommendation.
- Every non-safety outcome must retain a General Student Services or equivalent safe recovery route.
- Do not expose raw retrieval scores, internal matching terms, internal review notes, or diagnostic reason codes in learner-facing UI/API output.
- Preserve and strengthen existing safety escalation behaviour.

## Phase 0: discovery and plan

1. Inspect `main`, package scripts, architecture, test setup, current UI/API/retrieval/routing/escalation code, relevant documentation, and related feature branches.
2. Specifically inspect `feat/d5-d7-service-resolution-readiness` before rebuilding similar work.
3. Identify reusable work, conflicts, and source-of-truth files.
4. Create `docs/P0_SPRINT_EXECUTION_PLAN.md` containing architecture summary, workstream ownership, shared-file ownership, dependency order, test commands, risks, rollback plan, and acceptance criteria mapping.
5. Commit the plan to a lead branch before implementation.

## Required agent roles

Use isolated Git worktrees for implementation agents. Do not allow concurrent agents to edit the same files without clear ownership.

1. Lead/integration agent: shared foundation, scope control, planning, integration, final report.
2. P0.1 product engineer: resolution states, confidence gate, dual-entry UI, action cards, guided choice, free-text registry, behaviour tests.
3. P0.2 content/governance engineer: source metadata/status/validation, content lifecycle documentation, coverage matrix, source onboarding rules, content tests.
4. P0.3 accessibility/validation engineer: accessibility audit artifacts, test protocol, keyboard/focus/status-message/mobile checks, narrowly scoped accessibility fixes.
5. Independent reviewer: read-only architecture, safety, privacy, test, accessibility, and regression review.
6. Final integration verifier: read-only initially; may create a small, scoped integration-fix branch only when necessary and fully tested.

## Phase 1: shared foundation

Create `feat/p0-foundation-resolution-ready` and a draft PR.

Foundation establishes:

- `ResolutionState`: `confident_route`, `guided_choice`, `human_assisted`, `unsupported_query`, `safety_escalation`.
- Internal reason codes that are not rendered to learners.
- `SourceStatus`: `active`, `needs_review`, `unavailable`, `retired`.
- Safe typed source metadata: ID, journey, title, official URL, source owner, status, last-reviewed date, and optional review/effective-date fields.
- A safe `ResolutionResult` contract with learner message, state, action/recovery, and optional journey/source/options/escalation fields.
- A safety-first precedence rule.
- A source-status eligibility rule.
- Updates required by the acceptance matrix.

Do not add the complete UI, broad scoring logic, external dependencies, analytics, or LLM functionality in the foundation.

Run checks, open a draft PR, self-review it, and do not merge to `main`. If the owner has not merged the foundation before parallel work begins, document the exact dependency and expected rebase/merge instructions.

## Phase 2: P0.1 Resolution-First Navigation

Create `feat/p0.1-resolution-first-navigation`.

Implement:

1. Dual entry:
   - Academic support
   - Money, fees, and financial aid
   - Accommodations and accessibility
   - Wellbeing and safety
   - General student services
   - I’m not sure where to start
   - Optional plain-language free text
   - Persistent urgent-help/safety route

2. Deterministic results:
   - Safety has highest priority.
   - `confident_route` only has strong approved active-source evidence.
   - `guided_choice` handles close plausible low-risk routes.
   - `human_assisted` handles existing policy-sensitive/personalised matters.
   - `unsupported_query` handles weak, generic-only, no-coverage, or unsafe-to-guess requests.

3. Confidence controls:
   - Meaningful matched-term detection.
   - Generic-term-only detection.
   - Minimum confidence threshold.
   - First-versus-second score margin.
   - Documented constants and tests.
   - No public score data.

4. One-step guided category choice:
   - Fixed plain-language options.
   - No unconstrained chatbot loop.
   - “I’m not sure” and General Student Services retained.
   - Never after a safety trigger.

5. Action-first results:
   - Who can help.
   - What to do now.
   - Official source.
   - Plain-language explanation.
   - Choose another area.
   - General Student Services fallback.

6. Reviewed deterministic phrase, synonym, and typo mappings with metadata and tests.

Implement and test every relevant F and C acceptance ID. The Student Card and Wi-Fi cases must not become confident routes to an unrelated service.

## Phase 3: P0.2 Content Lifecycle and Quality

Create `feat/p0.2-content-lifecycle-quality`.

Implement:

1. Source metadata validation for source ID, journey, title, official allowlisted URL, owner, status, last-reviewed date, and applicable date fields.
2. Retrieval eligibility rules:
   - Active sources are eligible for confident routing.
   - Unavailable and retired sources are excluded from confident routing.
   - `needs_review` treatment is explicit, deterministic, documented, and tested.
   - A safe fallback exists when status prevents ordinary routing.
3. Documentation:
   - Coverage matrix for supported and unsupported areas.
   - Explicit current gaps: student cards, IT/Wi-Fi, records/transcripts, housing, parking, library, admissions/enrolment, plus any gap discovered in the approved corpus.
   - Source onboarding checklist.
   - Content review/change process and source-owner responsibilities.
4. Tests for validation, URL/source restrictions, unavailable/retired exclusion, and preservation of five supported journeys.

Do not add unsupported service sources merely to appear comprehensive.

## Phase 4: P0.3 Accessibility and Student Validation

Create `feat/p0.3-accessibility-student-validation`.

Implement/document:

1. WCAG 2.2 AA-oriented baseline where applicable:
   - Keyboard-only operation.
   - Visible focus.
   - Semantic headings, landmarks, buttons, and links.
   - Text-input labels/instructions.
   - Appropriate live/status messages after submission.
   - Logical focus management.
   - Understandable no-match and guided-choice recovery.
   - No colour-only state communication.
   - Responsive/reflow/mobile/touch-target testing.
   - Persistent, visible urgent-help route.
2. Compatible automated accessibility checks only when proportionate to existing setup.
3. Manual test script for resolution states, keyboard, mobile/reflow, source unavailability, safety, and recovery.
4. Hypothetical-scenario student-validation protocol for academic, financial, accommodation, Student Card, Wi-Fi, urgent safety, and uncertain-need scenarios.
5. Facilitator guide, privacy wording, observation sheet, severity rubric, and release-recommendation template.

Do not solicit or retain personal student cases or raw free text. Coordinate with P0.1 before editing shared UI files.

## Review and quality process

For each implementation branch:

1. Run repository lint, typecheck, unit/integration tests, acceptance-case tests, and relevant accessibility checks.
2. Record exact commands and results.
3. Use the independent reviewer to assess scope, safety precedence, privacy/logging, unsupported-query honesty, source governance, accessibility/recovery, golden cases, and supported-journey regressions.
4. Resolve must-fix findings within scope.
5. Open a draft PR with scope, summary, tests/results, acceptance impact, known limitations, accessibility impact, privacy/safety verification, and rollback notes.

## Merge and integration rules

- Do not merge any PR to `main`.
- Do not deploy.
- Expected merge order: foundation, P0.2, P0.1, P0.3.
- If P0.1 depends on the foundation, document exact rebase/merge instructions.
- Resolve simple conflicts only in a dedicated integration branch; do not perform unrelated refactors.
- The final integration verifier must report whether all PRs can merge in the stated order without unresolved conflict.

## Ready-for-demonstration gate

Report `READY FOR OWNER REVIEW AND DEMONSTRATION` only when:

- The acceptance matrix has not been weakened and all applicable IDs are mapped to evidence.
- A student can choose a visible category or write free text.
- The five supported journeys work for representative wording.
- Weak, generic, ambiguous, Student Card, and Wi-Fi queries do not become confident irrelevant routes.
- Every result has a specific next action or safe human route.
- Safety escalation bypasses ordinary flow.
- Source ownership, status, review date, and eligibility constraints are validated.
- Retired/unavailable sources cannot be confidently recommended.
- Keyboard, focus, labelled input, status messaging, recovery, colour independence, and mobile baseline are checked.
- Student-validation materials use hypothetical tasks and avoid personal data.
- No LLM, accounts, analytics, persistent learner input, external integration, deployment, or automatic main merge has been introduced.
- Known limitations, source-coverage gaps, failures, and blockers are reported honestly.

## Final Sprint Demonstration Pack

Return one report containing:

1. Overall status: `READY FOR OWNER REVIEW`, `BLOCKED`, or `NOT READY`.
2. Branches and draft PRs created, their purpose, commit SHA, and merge order.
3. Implementation summary for P0.1, P0.2, and P0.3.
4. Reusable work found in existing branches.
5. Acceptance matrix mapping: ID, status, evidence, branch, commit SHA.
6. Exact commands run and results.
7. A 5–10 step demonstration script.
8. Accessibility and student-validation evidence.
9. Privacy, safety, and governance verification.
10. Known limitations and out-of-coverage areas.
11. Decisions genuinely requiring the product owner.
12. Exact recommended next action for the product owner.
