# Day 0 Reconciliation Checklist

## Identifying Facts (Verified by Direct Inspection, Not Assumed)

- **Reconciliation branch**: `chore/reconcile-day3-and-strategy`
- **Reconciliation branch tip commit (source)**: `537e972e3c104b6ae4b5e2a440d84d8629167bae`
  ("Add Days 5–7 roadmap for demo readiness")
- **Historically accepted Day 3 branch**: `feat/day-03-routing`
- **Day 3 acceptance-record commit** (product-owner acceptance note): `32c4162`
- **Target branch**: `main`
- **`main` SHA at the start of this reconciliation**: `036d2fed5b94e5c5fb08f50284478a5716fff0ba`

## What This Reconciliation Actually Found

Direct inspection (`git log`, `git diff main..origin/chore/reconcile-day3-and-strategy`,
`gh pr view 4`) showed that Day 3's **code** was already merged into `main`:

- Pull Request #4 (`feat/day-03-routing` → `main`) is confirmed `merged:true`.
- `32c4162` (the Day 3 acceptance commit) is a verified ancestor of `main`.
- `main` at `036d2fe` contains `lib/routing.ts`, `lib/escalation.ts`, and all Day 1–3
  application code, confirmed by direct file inspection on `main`.

What was **not** yet on `main`: two commits pushed to `feat/day-03-routing` *after* PR #4
merged (`818d856` and `537e972`), adding Day 4 backlog items and a Days 5–7 roadmap to
`product/BACKLOG.md`. This reconciliation brings that content onto `main`, along with the
new delivery-hygiene protocol documents, so `main`'s backlog is current and this
double-drift pattern is documented and prevented going forward.

## Checklist — Content Preserved, Nothing Silently Changed

- [x] Day 1 baseline (application shell, health check, source catalogue, live NBCC-SS-001
      retrieval, dev-only source inspector) — present on `main`, unmodified by this
      reconciliation.
- [x] Day 2 baseline (curated corpus, deterministic keyword retrieval, dev-only retrieval
      inspector, golden questions, evaluation results) — present on `main`, unmodified.
- [x] Day 3 D3-01 through D3-05 (journey routing, all 6 policy-driven escalation triggers,
      extended golden questions with three separated metrics, dev-only routing inspector,
      `learning-log/DAY_03.md`) — present on `main`, unmodified.
- [x] `learning-log/DAY_02.md`, `learning-log/DAY_02_D2-01.md`, `learning-log/DAY_03.md`,
      and `learning-log/DAY_01_CLAUDE_RETRO.md` — present, unmodified.
- [x] `evals/golden_questions.json`, `evals/golden_questions_results.json`,
      `evals/routing_escalation_results.json` — present, unmodified. No expected-value
      field was changed by this reconciliation.
- [x] GQ-04's `expected_journey` remains `wellbeing_safety` (the product-intended, correct
      value) — verified unchanged. The corresponding journey-classification test remains
      genuinely failing (9/10), preserved as documented evidence, not concealed or reverted.
- [x] Day 4 scope, as recorded in this reconciliation's backlog update, is narrow: fix
      `D2-FU-01` retrieval robustness and bring GQ-04's journey classification to green,
      without introducing a model, embeddings, or expanding product scope.
- [x] Days 5–7 roadmap content is carried forward as planning documentation only — no Day
      5, 6, or 7 implementation work is started or implied as started by this
      reconciliation.
- [x] No LLM, embedding model, or vector database introduced anywhere in this reconciliation.
- [x] No real student data, personal data, or new personal-data collection introduced.
- [x] No external system integration (SIMS, Brightspace, Microsoft, or otherwise)
      introduced.
- [x] No new product scope introduced — this reconciliation is documentation and backlog
      hygiene only. Product code, golden-question expectations, source data, policy logic,
      and test behavior are unchanged (verified below).

## Pre-Merge Checks (Run From This Branch)

Run and record before opening the pull request:

```bash
npm test
npm run build
```

Production-mode gating (build for production, start it, and confirm):

```bash
NODE_ENV=production npm start
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/dev/sources     # expect 404
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/dev/retrieval   # expect 404
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/dev/routing     # expect 404
curl -s http://localhost:3000/api/health                                           # expect 200, {"status":"ok",...}
```

## Post-Merge Checks (Run From `main`, After the PR Merges — Not Before)

This is the "Reconcile" step in `product/REPOSITORY_DELIVERY_PROTOCOL.md`, and it is the
step whose absence caused this reconciliation to be necessary in the first place. It must
be run from a fresh checkout of `main`, not carried over from the feature branch.

```bash
git checkout main
git pull --ff-only
npm ci
npm test
npm run build
```

Record the resulting `main` SHA and the exact test/build output. If `npm test` reports
anything other than the known, documented GQ-04 failure (1 failed / 146 passed / 147
total at the time of writing), treat that as a new finding requiring investigation, not as
noise to explain away.

## Completion Criteria

This reconciliation is **not** complete when the pull request is opened, when it is
approved, or when a reviewer says "looks good." It is complete only when **all** of the
following are true, each verified by direct inspection rather than assumed:

1. The pull request from `chore/reconcile-day3-and-strategy` to `main` is merged.
2. `gh pr view <number>` (or equivalent) reports `merged:true`.
3. The resulting `main` commit SHA is recorded in `product/BACKLOG.md` and
   `learning-log/DAY_00.md`.
4. The Post-Merge Checks above have been run from that `main` SHA, and their results are
   recorded — not inferred from the pre-merge branch results.

Until all four are true, this increment's status in `product/BACKLOG.md` must read
"Accepted for merge" or "Implemented on branch," per
`product/REPOSITORY_DELIVERY_PROTOCOL.md`'s approved vocabulary — never "Merged / accepted
on main."
