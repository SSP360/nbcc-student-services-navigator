# Day 0 — Repository Reconciliation and Delivery Hygiene

**Date**: 2026-09-16
**Branch**: chore/reconcile-day3-and-strategy
**Scope**: Reconcile accepted Day 3 work and roadmap planning into `main`; adopt durable
delivery-hygiene documents so branch-level acceptance can never again be reported as
complete without verified integration into `main`. No Day 4 or product feature work
started.

---

## What Was Found (Verified, Not Assumed)

Fetched all remotes and inspected state directly before writing anything.

**Confirmed Day 3 code is already on `main`.** `git merge-base --is-ancestor 32c4162 main`
returned true; `git show main:lib/routing.ts` and `git show main:lib/escalation.ts` both
returned real file content. `gh pr view 4` confirms Pull Request #4
(`feat/day-03-routing` → `main`) has `state: MERGED`. `main`'s tip is `036d2fe`
("Merge pull request #4 from feat/day-03-routing").

**This differs from the task's initial framing**, which assumed Day 3 was still only on
the feature branch and not on `main`. That was true earlier in the Day 3 acceptance
process — for a period, `main` pointed at the initial-backlog commit (`cdf0a7d`) and did
not contain Day 1, Day 2, or the accepted Day 3 work at all. But by the time this Day 0
session began, PR #4 had already been opened, reviewed, and merged. Reporting the original
framing as still-current would have been inaccurate, so the backlog and protocol documents
in this reconciliation record the corrected, verified state instead of the assumed one.

**What was actually still missing from `main`**: two commits
(`818d856` "Add Day 4 epic and backlog items...", `537e972` "Add Days 5–7 roadmap...")
were pushed directly to the already-merged `feat/day-03-routing` branch after PR #4
merged, rather than to `main`. Both touch only `product/BACKLOG.md`. This is the real,
concrete Day 0 finding: not missing code, but planning documentation that drifted onto a
stale branch after its own PR had already closed — a second, independent instance of the
same root problem (branch content silently diverging from `main` post-merge) that
`product/REPOSITORY_DELIVERY_PROTOCOL.md` exists to prevent.

---

## What Was Verified From `main` Directly

Before writing any documentation, `main` (SHA `036d2fe`) was checked out clean and tested
directly — not inferred from the feature branch's prior results:

```
npm test
Test Suites: 1 failed, 9 passed, 10 total
Tests:       1 failed, 146 passed, 147 total
```

The one failure is the known, previously-documented GQ-04 journey-classification
assertion (`expected_journey: "wellbeing_safety"`, actual `academic_support`) — confirmed
present and unchanged on `main`, not concealed.

```
npm run build
✓ Compiled successfully, 10 routes generated
```

(A `node_modules`/`.next` cache staleness — the same intermittent issue previously seen
and root-caused in this repository's history, unrelated to any code change — required
`rm -rf node_modules .next && npm ci` before the build succeeded. This is environmental,
not a defect in `main`'s code.)

Production-mode gating, run against `main`'s build:

```
/api/dev/routing?q=wellness   -> 404
/api/dev/retrieval?q=wellness -> 404
/api/dev/sources              -> 404
/api/health                   -> 200 {"status":"ok",...}
```

---

## What This Reconciliation Does

1. Adds `product/REPOSITORY_DELIVERY_PROTOCOL.md`: the lifecycle, required evidence,
   approved status vocabulary, and branch rule that make this kind of drift detectable and
   preventable going forward. Records both verified findings (the acceptance-to-merge gap,
   and the post-merge backlog drift) as concrete, named evidence rather than a
   hypothetical.
2. Adds `product/RECONCILIATION_CHECKLIST.md`: the specific pre-merge and post-merge
   commands for this reconciliation, and the explicit rule that "PR opened" or "PR
   approved" is not "complete" — only a confirmed `merged:true` plus post-merge checks run
   from `main` counts.
3. Updates `product/BACKLOG.md`: adds this Day 0 section; corrects Day 3's status from a
   stale "pending merge" note to the verified "Merged / accepted on main" with PR number
   and SHA; marks Day 4 `Blocked` on this reconciliation's own merge; resequences Days 5–7
   to service-resolution proof, dual learner/staff handoff demonstration, and
   design-partner readiness; adds a Post-Demo Discovery section (interviews, competitive
   scan, pilot charter, value-model validation, go/no-go) explicitly marked as not product
   scope until validated; and adds a Deferred Horizon list requiring a charter amendment
   before any item on it could ever move into scope.

**No product code, golden-question expectations, source data, policy logic, or test
behavior was changed.** This is a documentation-and-backlog-only reconciliation, and that
was verified with `git diff --stat` before committing (see below).

---

## Files Changed

New:
- `product/REPOSITORY_DELIVERY_PROTOCOL.md`
- `product/RECONCILIATION_CHECKLIST.md`
- `learning-log/DAY_00.md` (this file)

Modified:
- `product/BACKLOG.md`

Untouched (verified): `lib/`, `app/`, `tests/`, `evals/`, `knowledge/`, `policies/`,
`package.json`, `next.config.js`, `tsconfig.json`.

---

## Known Defects Carried Forward (Not Hidden)

- **GQ-04 journey classification**: 9/10 journey classification accuracy on `main`.
  `academic_support` instead of the product-intended `wellbeing_safety`, due to `D2-FU-01`
  retrieval robustness. Escalation-trigger accuracy (10/10) and escalation-target accuracy
  (1/1) are unaffected — GQ-04 still escalates to Wellness and Counselling (`NBCC-SS-005`)
  correctly, independent of the journey label. This is Day 4's sole, narrowly-scoped
  priority once Day 0 merges.

---

## What Happens Next

Per `product/REPOSITORY_DELIVERY_PROTOCOL.md`'s own rule, no Day 4 (or other) work begins
from a new branch until:

1. This Day 0 pull request is merged into `main`.
2. `gh pr view` confirms `merged:true` and the resulting `main` SHA is recorded here and
   in `product/BACKLOG.md`.
3. Post-merge checks (`git pull --ff-only`, `npm ci`, `npm test`, `npm run build`) have
   been run from that `main` SHA and their results recorded.

This section will be updated with that SHA and those results once the PR merges — it is
intentionally left open here, not pre-filled, since the whole point of this reconciliation
is to stop treating "PR opened" as equivalent to "done."
