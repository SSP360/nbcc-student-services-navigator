# Repository Delivery Protocol

## Purpose

This protocol exists because this repository's own history shows that a branch being
functionally accepted, or even merged, is not the same as `main` reliably representing
that acceptance. This document makes `main` the single, unambiguous source of truth for
what has actually shipped, and defines the minimum evidence required before any increment
may be reported as complete.

## Governing Principle

**`main` is the sole authoritative integrated state of this repository.**

- A feature branch, however thoroughly tested, is a proposal, not a delivered result.
- A closed or merged pull request is evidence that a merge *event* occurred; it is not
  evidence that the *current* state of `main` still contains, and still passes, that work.
  `main` can move again after a PR merges. Only `main`'s current tip, checked directly,
  is authoritative.
- "Accepted by the product owner" describes a decision about a branch's content. It does
  not, by itself, describe the state of `main`. These are two different facts and must
  never be conflated in a status report.

## Required Lifecycle

Every increment (a Day, an epic, or a named backlog item) moves through these stages, in
order. No stage may be skipped or reported as complete on the strength of an earlier stage
alone.

1. **Plan** — the increment is defined in `product/BACKLOG.md` with an ID and scope.
2. **Implement** — work happens on a feature branch created from current `main` (see
   Branch Rule below).
3. **Verify** — tests and build are run *on the feature branch*, and results are recorded.
4. **Review** — a pull request is opened to `main`; the diff is reviewed by the product
   owner (or delegated reviewer) independently of the implementer's own report.
5. **Merge** — the pull request is merged. GitHub's `merged:true` status and the resulting
   `main` commit SHA are the event record.
6. **Reconcile** — tests, build, and acceptance checks are re-run *from a fresh checkout of
   `main`*, not from the feature branch. This is the step this repository's history shows
   is easy to skip, and skipping it is exactly how a merged branch can silently diverge
   from what `main` actually contains after further commits land elsewhere.
7. **Close** — the backlog entry is updated with the final `main` SHA, the Reconcile-step
   results, and any known defects. Only after Close may the increment be described as
   "Merged / accepted on main."

## No Increment May Be Called Complete Without

Every claim that an increment is done must be accompanied by all of the following, not a
subset:

- The active branch name and the `main` SHA it was based on.
- The pull request number and URL.
- GitHub's `merged:true` status for that PR (not "approved," not "ready to merge" — merged).
- The resulting `main` commit SHA after the merge.
- Test, build, and acceptance results run *from that `main` SHA*, not from the branch.
- The current `product/BACKLOG.md` status line for that item, with links to its evidence
  files.
- Any known defects, named explicitly, with the test or check that currently documents them.

A status report missing any of these items is incomplete and must not be described as
"done," "merged," or "on main."

## Approved Backlog Status Vocabulary

Only these values may be used in `product/BACKLOG.md` status lines. Free-text status
descriptions invite exactly the ambiguity this protocol exists to remove.

| Status | Meaning |
|---|---|
| `Planned` | Defined in the backlog; no branch yet exists. |
| `In progress` | A branch exists and work is underway; not yet feature-complete. |
| `Implemented on branch` | Work is complete on a feature branch; not yet reviewed or merged. |
| `Awaiting product-owner acceptance` | Implementation is complete and presented for review; no accept/reject decision recorded yet. |
| `Accepted for merge` | The product owner has accepted the branch's content, but it is **not yet** merged into `main`. This status must never be reported as equivalent to "done" or "on main." |
| `Merged / accepted on main` | The PR's `merged:true` status is confirmed, the resulting `main` SHA is recorded, and Reconcile-step checks have been run from that SHA. |
| `Blocked` | Cannot proceed; the blocking item must be named. |
| `Deferred` | Explicitly out of current scope, with the reason recorded. |

## Reconciliation Procedure for Disagreement

If the feature branch, the pull request, the backlog entry, and `main` do not all agree
(for example: the backlog says "Merged" but the PR is still open; or a PR merged but a
later commit landed on the feature branch and never reached `main`), the following order
of precedence applies while the disagreement is resolved:

1. Treat GitHub's live PR state (`merged:true`/`false`) and the current `main` SHA as the
   only facts, obtained by direct inspection (`gh pr view`, `git log`, `git diff` against
   `main`) — never assumed from a prior report, chat summary, or memory.
2. Diff the disputed branch against current `main` directly (`git diff main..<branch>`) to
   see exactly what, if anything, is not yet integrated.
3. Do not edit the backlog status to match whichever party's account is more convenient;
   set it to whatever the verified facts from step 1–2 actually support, using the
   vocabulary above.
4. If content exists on a branch that is not on `main`, open (or reuse) a reconciliation
   pull request whose sole purpose is bringing `main` current — do not silently continue
   layering new work onto the stale branch.
5. Record the disagreement and its resolution in the relevant `learning-log/DAY_*.md` file
   so the same gap is not rediscovered without context later.

## Branch Rule

**New implementation branches always start from current `main`.** Before creating a
branch, fetch and confirm the SHA of `main` you are branching from, and record it.

**A feature-to-feature merge is never a substitute for a final merge to `main`.** Merging
one feature branch into another (for example, to pull in a dependency's code) is a valid
way to unblock implementation work, but it does not change the fact that the *combined*
work still needs its own pull request into `main`, reviewed and merged like any other
increment. Continuing to commit to a branch after its pull request has merged — instead of
branching fresh from the new `main` — is exactly the pattern that caused the Day 0 finding
below, and is prohibited.

## Day 0 Finding (Recorded, Not Hidden)

Two independent, verified instances of the same root problem were found when this protocol
was written, both on this repository's actual history — not a hypothetical:

**Finding 1 — acceptance-to-merge gap.** Day 3 (Policy-Driven Routing and Escalation) was
functionally accepted by the product owner on branch `feat/day-03-routing` before a pull
request existed. For a period, `main` still pointed at an earlier commit (`cdf0a7d`,
the initial backlog) and did not contain the Day 1 application, the Day 2 retrieval
implementation, or the accepted Day 3 work at all. "Accepted" and "on `main`" were, for a
time, two different states of the world, reported in ways that could have been read as
equivalent.

**Finding 2 — post-merge branch drift.** Pull Request #4 (`feat/day-03-routing` → `main`)
was subsequently opened, reviewed, and merged (`merged:true`, resulting `main` SHA
`036d2fe`) — verified directly, not assumed. This correctly brought Day 1, Day 2, and Day 3
onto `main`. However, **after** that merge, two further commits (adding Day 4 backlog items
and a Days 5–7 roadmap to `product/BACKLOG.md`) were pushed directly to the
already-merged `feat/day-03-routing` branch rather than to `main`. `main`'s backlog file
was, again, not the authoritative record of the plan — a second, independent instance of
branch content silently diverging from `main` after a merge, this time in planning
documentation rather than code. This is the concrete finding that this Day 0 reconciliation
directly resolves and that this protocol is written to prevent from recurring.

## Known Defect Carried Into This Protocol (Not Concealed)

GQ-04 (a golden question testing a sexual-violence support query) is a **verified, currently
open, honest defect**, present on `main` as of SHA `036d2fe`:

- Journey classification accuracy: **9 of 10** golden questions. GQ-04 is classified as
  `academic_support` instead of the product-intended `wellbeing_safety`, because journey
  routing uses the top-1 retrieval result and the underlying retrieval robustness issue
  (`D2-FU-01`) currently ranks the wrong source first for this query.
- **Safety escalation is unaffected**: the crisis/safety escalation trigger matches the
  query's own text directly (independent of retrieval ranking or journey label) and always
  routes GQ-04 to Wellness and Counselling (`NBCC-SS-005`). Escalation-trigger accuracy is
  10/10; escalation-target accuracy is 1/1.
- This is preserved as a genuinely failing, committed test
  (`tests/routing-escalation-golden-questions.test.ts`), not skipped, inverted, or
  bypassed, and is recorded in `product/BACKLOG.md` as the explicit priority item for the
  next increment (`D2-FU-01` / Day 4).

## No Future Increment Starts Until This Protocol's Own PR Is Merged

Per this protocol's own rule: no new implementation work (Day 4 or otherwise) begins from
a branch until the Day 0 reconciliation pull request that introduces this protocol is
itself merged into `main`, and post-merge checks (Reconcile step) have been run from the
resulting `main` SHA. Starting Day 4 from a branch that predates this reconciliation would
repeat Finding 2 above.
