# Privacy-Safe Measurement Design

**Status**: Concept demonstrator. This is a **design**, not an implementation. No metric
below is currently collected, computed, stored, or reported by the running application.
No pilot has occurred. No real student data has been used to produce any number in this
document.

## Purpose

Define what a future, separately-approved pilot *could* measure, and — equally
importantly — draw a hard, explicit line around what is not collected or implemented now,
so a design partner can evaluate the measurement approach before any real deployment
decision, not discover the boundary later.

## What a Future Pilot Could Measure

Each metric below is a **hypothesis for future definition**, not a current capability. None
requires storing an individual student's identity to be computed in aggregate.

| Metric | What it would tell a design partner | How it could be computed without individual tracking |
|---|---|---|
| **Retrieval correctness** | Does the system surface the right source for a given query? | Golden-question-style evaluation against a held-out or growing query set, aggregated as a pass rate — the same method already used in `evals/golden_questions_results.json`, extended with real (anonymized/synthetic) query patterns from a pilot if approved. |
| **Journey correctness** | Does the query route to the right service category? | Same aggregate evaluation method, applied to `evals/routing_escalation_results.json`'s existing schema. |
| **Escalation correctness** | Are sensitive/complex queries correctly identified and routed to a human? | Aggregate rate of correct trigger/target pairs against a reviewed sample — never stored per-individual. |
| **Successful referral** | Did the learner actually reach the named human service? | Would require the receiving service to separately confirm contact was made — an aggregate count on the *service's* side, not a tracking pixel or session ID on the demonstrator's side. |
| **Repeat contact** | Did the same unresolved need recur? | Only measurable in aggregate (e.g., "how often does this topic recur across time") without any individual-level linkage — a future design question, not solved here. |
| **Time to resolution** | How long from question to reaching the right human? | Aggregate timing only, and only if a pilot separately defines a privacy-safe start/end event pair — not designed in this increment. |
| **Staff handling effort** | Does the escalation packet reduce staff triage time? | Staff self-report or aggregate time-on-task, collected by the receiving service under its own consent/process — not by this demonstrator. |
| **Learner effort and confidence** | Did the learner feel the process was easy and trustworthy? | Optional, anonymous post-interaction survey — no identity linkage, no free-text retention beyond aggregate sentiment categories, and only if separately approved. |
| **Content-gap frequency** | How often does a query find no good source? (The `accessibility_inclusion`/`financial_support` content-coverage gap disclosed in Days 5–7 was closed in P0; this metric now measures the ordinary residual case of a query no curated source addresses, not a known missing journey.) | Aggregate count of `unmatched_query` or low-confidence-score events, with query *topic* categorized, not query *text* retained. |
| **Adoption and human override** (only if a future staff-assist pilot is separately approved) | Do staff actually use and trust the system's suggestions, or override them? | Aggregate override rate — requires a staff-facing feature that does not exist today and would need its own scope decision. |

## What Is Explicitly Not Collected or Implemented Now

This is not an aspirational list to be relaxed quietly later — each item below requires a
separate, documented scope decision (per `product/PRODUCT_CHARTER.md`'s "Scope Amendment
Process") before it could change:

- **No student identity** of any kind (name, ID, email, IP, device fingerprint).
- **No real student query logging.** The application does not persist any query today —
  confirmed by `policies/DATA_POLICY.md` and unchanged by this increment.
- **No free-text retention** beyond the single already-disclosed matched keyword shown in
  the demonstration handoff packet (`dual-perspective-demo.md`), which itself is not
  persisted anywhere — it exists only in that document as an illustration.
- **No individual-level tracking** — no session IDs, no cookies, no analytics pixels.
- **No cookies.** None are set by the application today.
- **No persistent analytics.** No analytics service or dashboard exists or is proposed to
  be added in this increment.
- **No case history.** There is no database, and none is proposed here.
- **No sensitive disclosure storage.** A crisis/safety disclosure's content is used only
  in-memory, for the single request/response cycle, exactly as today's `lib/escalation.ts`
  already operates — not changed by this document.
- **No claim that any of the metrics above have already been measured.** Every number in
  this repository's evaluation artifacts (`evals/`) is a deterministic-pipeline
  self-test against public source content — not a measurement of real student outcomes,
  and this document does not conflate the two.

## Relationship to Existing Evidence

This design does not require new infrastructure to *describe*. The existing dev-only
inspectors (`/dev/retrieval`, `/dev/routing`) already expose, per-request, exactly the
kind of structured decision data (`matched_terms`, `journey`, `escalation` fields) that a
future privacy-safe measurement pipeline would aggregate — see
[`evidence-inventory.md`](evidence-inventory.md). No new capability was built to write
this document.
