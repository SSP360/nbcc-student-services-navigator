# Resolution-Ready Acceptance Matrix

## Purpose

This document is the authoritative release acceptance contract for the combined P0 release:

- P0.1 Resolution-First Navigation
- P0.2 Content Lifecycle and Quality
- P0.3 Accessibility and Student Validation

It is the independent validation basis for implementation work. An implementation-agent summary, pull-request description, or model-generated claim of completion is not sufficient evidence of acceptance.

## Product objective

Help students reach the shortest safe, actionable path to the correct service.

The product must not optimise for contact deflection. A correct human-assisted route is a successful outcome when self-service is insufficient, inappropriate, unsupported, or unsafe.

## Non-negotiable constraints

- No LLM or generative-AI integration.
- No user accounts, learner profiles, conversation history, or persistent individual free-text storage.
- No individual analytics or behavioural profiling.
- No autonomous eligibility, funding, accommodation, health, safety, legal, disciplinary, or case-specific decisions.
- Safety escalation overrides retrieval, confidence, clarification, and normal result presentation.
- Only approved and active institutional sources may support a confident route.
- Retired or unavailable sources cannot be confidently recommended.
- Raw retrieval scores, matched terms, internal reason codes, source-review notes, and internal ownership details are not shown in learner-facing UI/API.
- Every non-safety result has a usable recovery path, including General Student Services or an equivalent approved human route.
- The system must be honest when a request is unsupported or uncertain.

## Resolution states

| State | Meaning | Required student outcome |
|---|---|---|
| `confident_route` | Strong approved active-source evidence | Show named service, concrete action, official source, and recovery option |
| `guided_choice` | Ambiguous but low-risk need | Show fixed plain-language choices and an “I’m not sure” route |
| `human_assisted` | Personalised, policy-sensitive, or judgment-required need | Show named human service, reason, and safe next action |
| `unsupported_query` | Weak, generic-only, no-coverage, or unsafe-to-guess request | State uncertainty plainly and route to General Student Services |
| `safety_escalation` | Defined safety trigger | Show urgent safe human/escalation action; bypass ordinary flow |

## Functional acceptance cases

| ID | Student input or action | Required state | Required primary outcome | Must not happen |
|---|---|---|---|---|
| F-01 | Select “Academic support” | `confident_route` | Academic Support action card | Require free text |
| F-02 | Select “Money, fees, and financial aid” | `confident_route` or approved `human_assisted` | Financial Support route | Give personalised eligibility decision |
| F-03 | Select “Accommodations and accessibility” | `confident_route` | Accessibility action card | Ask for disability/medical details |
| F-04 | Select “Wellbeing and safety” | Safe wellbeing route | Visible urgent-help option | Hide human/urgent route |
| F-05 | Select “General student services” | `human_assisted` or direct general route | General Student Services action | Attempt unrelated retrieval |
| F-06 | Select “I’m not sure where to start” | `guided_choice` or general route | Plain-language support choices + human fallback | Force free-text input |
| F-07 | “I need help studying for exams” | `confident_route` | Academic Support | Route to unrelated service |
| F-08 | “I’m broke and can’t pay my fees” | `confident_route` or `human_assisted` | Financial Support route | State eligibility or funding outcome |
| F-09 | “I need extra time on an exam” | `confident_route` | Accessibility route | Require personal health/disability details |
| F-10 | “accomodation support” | `confident_route` | Accessibility route | Fail solely due to common typo |
| F-11 | “I was sexually assaulted” | `safety_escalation` | Approved safety/wellbeing escalation | Show ordinary guided choice or generic search result |
| F-12 | “How do I get a replacement student card?” | `unsupported_query` | General Student Services route | Route confidently to Academic Support |
| F-13 | “My Wi-Fi isn’t working” | `unsupported_query` | General Student Services route | Route confidently to an unrelated support area |
| F-14 | “I need help” | `guided_choice` or `unsupported_query` | Category choices and/or General Student Services | Arbitrary confident route |
| F-15 | “I’m stressed, need accommodation, and can’t pay fees” | `guided_choice` or `human_assisted` | Safe choice/human route | Silently select one issue as definitive |
| F-16 | Select “Need urgent help or feel unsafe?” | `safety_escalation` | Urgent route without entering search | Require search submission |
| F-17 | Choose a guided category | `confident_route` or appropriate human route | Journey-specific action card | Lose access to start-over/fallback |
| F-18 | Choose “This is not the right service” | Recovery state | Category selection + General Student Services | Dead end |

## Confidence and recovery requirements

| ID | Requirement | Evidence |
|---|---|---|
| C-01 | Generic terms cannot alone create a confident route | Automated retrieval test |
| C-02 | Weak/no meaningful match becomes `unsupported_query` | Automated API/retrieval test |
| C-03 | Close plausible low-risk routes become `guided_choice` | Automated API/retrieval test |
| C-04 | Safety detection runs before confidence/clarification | Precedence test |
| C-05 | Each state provides a safe next action or recovery | UI/API test |
| C-06 | Thresholds and generic-term rules are documented and versioned | Code/configuration review |
| C-07 | Internal ranking/scores/matched terms remain private | API-response and UI inspection |

## Source governance requirements

| ID | Requirement | Evidence |
|---|---|---|
| G-01 | Each approved source has ID, journey, title, official allowlisted URL, owner, status, and last-reviewed date | Schema/data validation |
| G-02 | Supported source statuses are `active`, `needs_review`, `unavailable`, and `retired` | Type/schema test |
| G-03 | `retired` sources are excluded from retrieval and confident routing | Test fixture |
| G-04 | `unavailable` sources are excluded from confident routing and produce safe fallback behaviour | Test fixture |
| G-05 | `needs_review` behaviour is documented, deterministic, and tested | Test fixture/document review |
| G-06 | Sources outside the approved allowlist cannot be added/recommended | Schema/configuration test |
| G-07 | Current unsupported areas are recorded in the coverage matrix | Documentation review |
| G-08 | New-source onboarding requirements are documented | Documentation review |

## Accessibility requirements

| ID | Requirement | Evidence |
|---|---|---|
| A-01 | All category cards, text entry, results, fallback controls, and urgent-help route are keyboard operable | Manual test |
| A-02 | Keyboard focus is visible at every interactive step | Manual test |
| A-03 | Form inputs have programmatic labels and clear instructions | Automated/manual inspection |
| A-04 | Result, no-match, guided-choice, and safety state changes are announced appropriately | Automated/manual screen-reader-oriented check |
| A-05 | Focus moves logically after submission without unexpected context loss | Manual test |
| A-06 | State is not communicated through colour alone | Visual inspection |
| A-07 | Layout works at narrow mobile viewport and at zoom/reflow | Manual responsive test |
| A-08 | Student-facing labels use plain language rather than requiring office-name knowledge | Content review |
| A-09 | Urgent help remains visible and usable without free-text submission | Manual test |
| A-10 | No-match/error recovery explains what happened and what the student can do next | Manual test |

## Student validation requirements

| ID | Requirement | Evidence |
|---|---|---|
| V-01 | A hypothetical-scenario facilitation guide exists | Repository artifact |
| V-02 | Scenarios include academic, financial, accommodation, unsupported Student Card, unsupported Wi-Fi, urgent safety, and uncertain-need cases | Repository artifact |
| V-03 | The protocol does not solicit or retain real personal cases or raw learner free text | Privacy review |
| V-04 | Observation sheet records correct-service reach, time to meaningful action, recovery, comprehension, and barriers | Repository artifact |
| V-05 | Findings include severity and release recommendation format | Repository artifact |

## Required checks before owner review

- Dependency installation succeeds using the repository’s supported method.
- Lint passes.
- Typecheck passes.
- Unit and integration tests pass.
- Acceptance-case tests pass.
- Source metadata/schema validation passes.
- Available automated accessibility checks pass.
- Manual keyboard, focus, mobile/reflow, and state-announcement test script is completed.
- Independent review finds no unresolved must-fix safety, privacy, accessibility, or regression issue.
- All draft PRs can merge in the documented order without unresolved conflict.
- The final report lists known limitations and unsupported service areas honestly.

## Demonstration gate

The sprint is ready for owner review only when all required functional, confidence/recovery, source-governance, and engineering checks pass. Accessibility and student-validation artifacts must be complete, and no critical accessibility or safety defect may remain open.

A “ready” claim must include links to the relevant tests, PRs, validation output, and the completed acceptance result table.
