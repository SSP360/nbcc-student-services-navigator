# Executive Design-Partner Narrative

**Status**: Concept demonstrator, presented to a design-partner audience for an
evidence-based conversation — not a sales claim of production readiness.

## What This Demonstrator Proves

A student-services question can be answered by a fully deterministic pipeline —
no language model, no embeddings, no external AI service — that:

1. Retrieves the correct approved public source for a question, with every match
   explainable down to the exact keyword and its weighting (`evidence-inventory.md`).
2. Classifies the question into one of five canonical service journeys.
3. Correctly identifies sensitive or complex questions and escalates them to a named
   human contact — a safety property that is *independent of the retrieval ranking*,
   verified by a real bug found and fixed during development (`learning-log/DAY_03.md`).
4. Does all of this with 10/10 accuracy on its current evaluation set, using a
   repeatable, inspectable evaluation method — not a one-time demo run
   (`evals/routing_escalation_results.json`).

Three of five canonical journeys are demonstrated end-to-end today
(`service-resolution-traces.md`); the other two have proven-correct routing logic but
require curating two more already-approved public sources to close the loop — a small,
well-understood, scoped task, disclosed rather than hidden.

## What This Demonstrator Does Not Prove

- **Not that this is what students actually want or need.** No discovery interview has
  been conducted with real students or staff as part of this repository's work.
- **Not that any institution has validated this approach.** No pilot partner has been
  secured; no institution's staff or students have used this system.
- **Not that any financial outcome results.** No cash savings, cost avoidance, or
  retention claim has been measured (`baseline-value-worksheet.md`).
- **Not that this is production-ready.** No authentication, no real-data handling, no
  live system integration, no public deployment — all deliberately deferred.
- **Not that the underlying market research (in `research/canadian-education-market`,
  referenced but not incorporated as current scope) has been validated by real buyer
  conversations.** That branch is independent strategy/research material, not part of
  this product's proven capability.

## The Service-Resolution Wedge

The narrow, defensible claim this project makes is: **before an institution should trust
an AI system to have a conversation with a student, it should be able to prove the system
reliably knows *where to send that student* and *when to get a human involved instead*.**
This is a smaller, more verifiable claim than "conversational AI for student services,"
and it is the claim this repository actually demonstrates with real, reproducible
evidence rather than a plausible-sounding demo.

## Why Deterministic Provenance, Routing, and Escalation Are Differentiators

- **Provenance**: every answer traces to a specific, named, approved public source —
  never a generated claim (`policies/ANSWER_POLICY.md`).
- **Determinism**: the same query always produces the same result, and every result is
  explainable in terms a non-technical reviewer can audit (`matched_terms`, `reason`
  fields throughout `lib/`) — no black-box model behavior to account for.
- **Escalation independence from ranking**: the most safety-critical property found
  during development is that a crisis/safety disclosure escalates correctly even when the
  underlying retrieval ranking is imperfect (`learning-log/DAY_03.md`,
  `learning-log/DAY_04.md`) — a property that is easy to lose if this capability is later
  rebuilt on top of a probabilistic model without the same explicit design discipline.

## The Future Value-Led Hybrid-AI Direction (Deferred Architecture Only)

A future direction — combining this deterministic foundation with a governed,
scoped generative or retrieval-augmented layer — exists as strategy material in the
`docs/adr-value-led-hybrid-ai` branch. **That branch is not incorporated into this
increment's scope, and no content from it is treated as current product capability
here.** It is named in this narrative only so a design partner understands that
today's deterministic system is a deliberate, evidence-first foundation — not the
end state — and that any future move toward generative capability would require its
own explicit scope decision, governance review, and safety redesign, not an
incremental drift.

## The Proposed Bounded Pilot and Evidence Required Before Scaling

See [`pilot-charter.md`](pilot-charter.md) for the full charter. In summary: a 90-day,
no-real-data, no-live-integration pilot with one design-partner institution, testing
whether this deterministic approach holds up against real (anonymized) institutional
questions, with explicit safety stop conditions and a scale/revise/stop decision at the
end — not an assumption that scaling is the default outcome.
