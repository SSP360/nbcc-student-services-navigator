# Product Charter

## Product Name

NBCC Student Services Navigator — Concept Demonstrator

## Vision

Empower NBCC students with fast, accurate access to student services information and direct pathways to appropriate human support.

## Mission

Help a student:
1. Identify relevant NBCC Student Services information.
2. Understand the next step.
3. Reach the appropriate human service.

## Non-Goals (Explicitly Out of Scope)

- Autonomous decision-making (e.g., eligibility, approval, accommodation).
- Student identity management or authentication.
- Integration with SIMS, Brightspace, or Microsoft systems.
- Replacement of human advisors or support staff.
- Financial, legal, medical, or accessibility advice.
- Case management or ticketing system.
- Analytics or usage tracking.

## Key Constraints

- **Non-production**: Concept demonstrator only.
- **Public information only**: Uses NBCC publicly available sources.
- **No personal data**: Does not collect, store, or process student personal information.
- **No LLM on Day 1**: Placeholder question field only; AI integration deferred to Day 2+.
- **Escalation required**: Sensitive or complex questions route to human support.

## Intended User

NBCC students seeking to understand what services are available and how to access them.

## Success Criteria (Day 1)

- Application runs locally without errors.
- Students can type questions into an input field.
- Application displays public NBCC information from approved sources.
- Application directs complex/sensitive questions to human support.
- Disclaimer is visible and clear.
- Health-check endpoint confirms system status.

## Governance

- All changes require tests and code review.
- Product scope changes require Charter amendment.
- Release decisions are made by authorized humans, not by AI agents.
- AI agents cannot approve their own work.

## Timeline

- **Day 1**: Local application shell, source retrieval, placeholder question field.
- **Day 2+**: LLM integration, semantic search, case management (deferred pending approval).

