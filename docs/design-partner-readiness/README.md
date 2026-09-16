# Design-Partner Readiness Package

**This entire package is:**

- A **concept demonstrator**, not a production service.
- Based on **approved public NBCC source material** (`knowledge/sources.yaml`), or, where
  noted, institution-approved non-sensitive material for a future pilot.
- **Synthetic or demonstration-only** wherever queries, scenarios, or handoff packets are
  shown — no real student ever entered any query shown in this package.
- **Not a live handoff or case-management workflow** — the staff-perspective demonstration
  is a static illustration, not an integration.
- **Not a validated market, financial, or retention claim** — no institution has confirmed
  any value hypothesis in this package; every value claim is explicitly framed as a
  hypothesis to be tested, not a result.

If any single document in this package appears to contradict the labels above, treat the
labels above as authoritative and flag the discrepancy.

## Contents

| Document | What it covers |
|---|---|
| [`evidence-inventory.md`](evidence-inventory.md) | What already exists (Days 1–4) and where each claim is evidenced — read this first. |
| [`service-resolution-traces.md`](service-resolution-traces.md) | Five real, reproducible pipeline traces, one per canonical journey — including an honest disclosure that two journeys have a content-coverage gap. |
| [`dual-perspective-demo.md`](dual-perspective-demo.md) | The same safety-critical scenario shown from the learner's side and a demonstration-only staff handoff packet. |
| [`measurement-design.md`](measurement-design.md) | What a future pilot could measure, and an explicit list of what is not collected or implemented now. |
| [`baseline-value-worksheet.md`](baseline-value-worksheet.md) | Distinguishes cash savings, capacity release, cost avoidance, and retention hypotheses — no numbers claimed. |
| [`pilot-charter.md`](pilot-charter.md) | A draft, unapproved 90-day bounded pilot charter: scope, exclusions, gates, success measures, safety stop conditions. |
| [`executive-narrative.md`](executive-narrative.md) | What the demonstrator proves, what it does not, and the proposed path forward. |
| [`governance-evidence-dossier.md`](governance-evidence-dossier.md) | Consolidated governance controls, test/evaluation evidence, scope boundaries, and the correction/incident path. |

## Evidence Index (Where Every Claim Comes From)

| Claim category | Primary evidence |
|---|---|
| Source approval and curation | `knowledge/sources.yaml`, `knowledge/curated/`, `tests/curated-sources.test.ts` |
| Retrieval correctness | `lib/retrieval.ts`, `tests/retrieval.test.ts`, `evals/golden_questions_results.json` |
| Journey routing correctness | `lib/routing.ts`, `tests/routing.test.ts` |
| Escalation correctness and safety independence | `lib/escalation.ts`, `tests/escalation.test.ts`, `learning-log/DAY_03.md` |
| Combined evaluation results | `evals/routing_escalation_results.json` |
| Production-mode safety gating | `learning-log/DAY_05_07.md` (this increment's re-verification), prior days' learning logs |
| Delivery/reconciliation discipline | `product/REPOSITORY_DELIVERY_PROTOCOL.md`, `product/RECONCILIATION_CHECKLIST.md` |
| Governance and prohibited scope | `AI_OPERATING_INSTRUCTIONS.md`, `policies/`, `product/PRODUCT_CHARTER.md`, `product/SCOPE.md` |

## What This Package Is Not

- Not evidence that any student, staff member, or institution has used this system.
- Not evidence that the future hybrid-AI direction referenced in `executive-narrative.md`
  has been built, tested, or approved — it is named strategy material on an independent
  branch (`docs/adr-value-led-hybrid-ai`), not current scope.
- Not a request for budget, procurement, or a signed pilot agreement — `pilot-charter.md`
  is a starting point for negotiation, not a proposal awaiting signature.

## How to Verify Anything in This Package Yourself

Every quantitative claim traces to a command you can run against this repository:

```bash
npm ci
npm test              # 152+ tests, includes all evaluation-adjacent assertions
npm run build         # confirms the application builds cleanly
npm run dev            # then query http://localhost:3000/api/dev/routing?q=<your question>
```

Production-mode gating (development-only routes must 404):

```bash
npm run build && NODE_ENV=production npm start
curl -i http://localhost:3000/api/dev/sources     # expect 404
curl -i http://localhost:3000/api/dev/retrieval   # expect 404
curl -i http://localhost:3000/api/dev/routing     # expect 404
curl -i http://localhost:3000/api/health          # expect 200
```
