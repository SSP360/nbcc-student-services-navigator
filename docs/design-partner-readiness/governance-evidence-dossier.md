# Governance and Evidence Dossier

**Status**: Concept demonstrator. This dossier summarizes governance controls and
evidence that already exist in this repository — it does not introduce any new control,
and every claim below cites a specific file, test, or command a reviewer can verify
independently.

## Approved-Source Provenance

- All institutional content originates from `knowledge/sources.yaml` — 7 approved public
  NBCC sources, each requiring `authority: nbcc_public` and
  `review_status: prototype_public_source` (enforced by `lib/sources.ts` validation,
  `tests/sources.test.ts`, `tests/curated-sources.test.ts`).
- 5 of 7 are curated into machine-readable evidence (`knowledge/curated/`), each carrying
  source ID, title, URL, domain, campus, language, retrieval timestamp, retrieval method,
  and extracted text (`lib/curated-sources.ts`). See
  [`evidence-inventory.md`](evidence-inventory.md) for the full source-by-source table —
  the 2-source curation gap disclosed in Days 5–7 was closed in P0.

## Deterministic Retrieval, Routing, and Escalation Controls

- **Retrieval** (`lib/retrieval.ts`): no model, no embedding, no external service —
  keyword matching with transparent, auditable scoring. 26 tests
  (`tests/retrieval.test.ts`).
- **Routing** (`lib/routing.ts`): fixed domain-to-journey lookup table, falls back to
  `general_contact` on no match per `policies/ANSWER_POLICY.md`'s "No Source, No Answer."
  16 tests (`tests/routing.test.ts`).
- **Escalation** (`lib/escalation.ts`): all 6 `policies/ESCALATION_POLICY.md` triggers
  implemented as deterministic checks; the two most safety-critical triggers
  (`crisis_or_safety`, `accommodation_request`) route to a hardcoded target independent of
  retrieval/journey ranking — a design property directly motivated by a real bug found
  and fixed during development (`learning-log/DAY_03.md`). 22 tests
  (`tests/escalation.test.ts`).

## Golden-Question and Routing Evaluation Results

Current state (branch `feat/p0-five-journey-ux`, base `main` @ `e1f2f7f`):

| Metric | Result | Source |
|---|---|---|
| Retrieval top-1 accuracy | 12/12 | `evals/golden_questions_results.json` |
| Retrieval top-3 accuracy | 12/12 | `evals/golden_questions_results.json` |
| Journey classification accuracy | 12/12 | `evals/routing_escalation_results.json` |
| Escalation-trigger accuracy | 12/12 | `evals/routing_escalation_results.json` |
| Escalation-target accuracy | 2/2 (GQ-04 and GQ-11, added in P0, currently escalate) | `evals/routing_escalation_results.json` |

These are self-tests of the deterministic pipeline against public source content and
demonstration queries — not a measurement of real student outcomes (see
`measurement-design.md` for that distinction).

## Production-Mode Development-Route Gating

`/dev/sources`, `/dev/retrieval`, `/dev/routing` and their API counterparts are gated by
`process.env.NODE_ENV !== 'development'` returning `404`. Verified against a real
`NODE_ENV=production` build in this increment's [Gate 4 verification](../../learning-log/DAY_05_07.md)
and in every prior day's learning log — a consistent, repeated control, not a one-time
check.

## Scope Boundaries and Prohibited Behaviours

Governed by `AI_OPERATING_INSTRUCTIONS.md` (10 operating principles, prohibited
behaviours list, definition of done) and `policies/PROHIBITED_ACTIONS.md`. Currently, and
throughout this repository's history: no LLM, no embeddings, no vector database, no
authentication, no real student data, no SIMS/Brightspace/Microsoft integration, no
analytics, no public deployment. This increment introduces none of these either — see the
diff-scope confirmation in `learning-log/DAY_05_07.md`.

## Current Limitations

Consolidated from `evidence-inventory.md`: no stemming/word-form normalization; a
corpus-scaling limitation of the Day 4 exclusive-term weighting fix (materially proven in
P0, not just theoretical — see `learning-log/P0_COVERAGE_UX.md`); GQ-02's retrieval
fragility; and, most fundamentally, no real-data or live-workflow validation of any kind
to date. The 2-of-7-source curation gap affecting `accessibility_inclusion` and
`financial_support` disclosed in Days 5–7 was closed in P0.

## Correction/Incident Path

This repository's own history is the evidence for how corrections are handled: Day 3's
GQ-04 defect was found, preserved as a genuinely failing, documented test rather than
hidden, and fixed in Day 4 with the fix itself evidence-verified before being reported
complete (`learning-log/DAY_03.md`, `learning-log/DAY_04.md`). `product/REPOSITORY_DELIVERY_PROTOCOL.md`
formalizes this: every increment requires a recorded base SHA, PR number, `merged:true`
confirmation, resulting `main` SHA, and post-merge re-verification before being reported
as "Merged / accepted on main" — not "implemented" or "in a PR" being treated as
equivalent to shipped.

## Future Hybrid-AI Direction — Governed Future Option, Not Implemented Capability

As stated in `executive-narrative.md`: a future value-led hybrid-AI direction exists as
strategy material in `docs/adr-value-led-hybrid-ai`, an independent branch not
incorporated into this increment. It is recorded here only as a named future option
requiring its own governance review, scope decision, and safety redesign — not as a
roadmap commitment or a current capability.
