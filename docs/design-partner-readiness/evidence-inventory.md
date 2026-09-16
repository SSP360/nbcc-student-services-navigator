# Evidence Inventory

**Status**: Concept demonstrator. All content below is evidence about the existing
deterministic pipeline (Days 1–4), inspected and re-verified for this increment — not new
claims and not fabricated output.

This inventory exists so every claim made elsewhere in this readiness package points to a
real file, test, or command a reviewer can run themselves. Nothing here was recreated
merely because equivalent evidence already exists in another day's learning log.

## Approved Source Catalogue

`knowledge/sources.yaml` — 7 approved public NBCC sources, each with `authority:
nbcc_public` and `review_status: prototype_public_source`:

| ID | Title | Domain | Curated? |
|---|---|---|---|
| NBCC-SS-001 | Student Services at NBCC | `general_student_services` | ✅ Yes |
| NBCC-SS-002 | Student Success Coaching | `academic_support` | ✅ Yes |
| NBCC-SS-003 | PASS Guideline | `academic_support` | ❌ No |
| NBCC-SS-004 | Accessibility and Inclusion Services | `accessibility` | ❌ No |
| NBCC-SS-005 | Wellness and Counselling | `wellbeing` | ✅ Yes |
| NBCC-SS-006 | Student Loans | `financial_support` | ❌ No |
| NBCC-SS-007 | Contact NBCC | `contact_routing` | ❌ No |

**Important, previously-untracked finding surfaced by this increment**: only 3 of the 7
approved sources have been curated into `knowledge/curated/` (NBCC-SS-001, NBCC-SS-002,
NBCC-SS-005 — the Day 2 scope decision). NBCC-SS-004 (accessibility) and NBCC-SS-006
(financial support) are approved in the catalogue but have no curated content, so the
retrieval pipeline cannot resolve them today. This is addressed transparently in
[`service-resolution-traces.md`](service-resolution-traces.md) rather than glossed over,
and recorded as a limitation below.

## Canonical Journeys

Defined in `lib/routing.ts` (`JOURNEYS` constant and `DOMAIN_TO_JOURNEY` map):
`academic_support`, `financial_support`, `accessibility_inclusion`, `wellbeing_safety`,
`general_contact`. Verified correct-by-construction for all five, including the two
not-yet-curated ones, by `tests/routing.test.ts` (`maps accessibility domain to
accessibility_inclusion journey`, `maps financial_support domain to financial_support
journey`, and the `JOURNEYS constant` test).

## Deterministic Retrieval

`lib/retrieval.ts` — `searchCuratedSources()`. No model, embedding, or external service.
Title/domain/body keyword matching with a document-frequency exclusive-term weighting
(Day 4 fix: a term occurring in exactly one curated document's body receives a 3×
multiplier on its body contribution). Every result carries `matched_terms` showing exactly
which query terms matched, where, and whether the exclusive-term multiplier applied.
Evidence: `tests/retrieval.test.ts` (26 tests), `evals/golden_questions_results.json`
(10/10 top-1 accuracy over the real curated corpus).

## Routing and Escalation

`lib/routing.ts` — maps a matched source's `domain` to a journey with a human-readable
reason; falls back to `general_contact` when nothing matches, citing `ANSWER_POLICY.md`'s
"No Source, No Answer" rule.

`lib/escalation.ts` — implements all 6 triggers named in `policies/ESCALATION_POLICY.md`
(`crisis_or_safety`, `source_error`, `unmatched_query`, `accommodation_request`,
`personalized_decision`, `urgent_timeframe`), each a deterministic keyword or error check,
evaluated in a fixed priority order. The `crisis_or_safety` trigger always targets
`NBCC-SS-005` (Wellness and Counselling) directly, independent of the journey/retrieval
ranking — this is a real, tested safety property, not aspirational (see
`tests/escalation.test.ts`, "always targets Wellness and Counselling... independent of the
journey argument").

Evidence: `tests/routing.test.ts` (16 tests), `tests/escalation.test.ts` (22 tests),
`tests/routing-escalation-golden-questions.test.ts` (27 tests),
`evals/routing_escalation_results.json` — journey classification 10/10, escalation-trigger
accuracy 10/10, escalation-target accuracy 1/1.

## Development-Only Inspectors (Not Student-Facing)

- `/dev/sources` + `/api/dev/sources` — source catalogue and NBCC-SS-001 live-retrieval evidence.
- `/dev/retrieval` + `/api/dev/retrieval` — keyword retrieval inspector, shows matched terms and scores.
- `/dev/routing` + `/api/dev/routing` — full query → retrieval → journey → escalation pipeline inspector.

All three are gated by `process.env.NODE_ENV !== 'development'` returning `404`, verified
against a real `NODE_ENV=production` build in every prior day's learning log and
re-verified in this increment (see [Gate 4 verification](../../learning-log/DAY_05_07.md)).

## Test Suite and Build

152 tests across 10 suites, all passing as of `main` @ `3c7f3e5` (Day 4 baseline for this
increment). `npm run build` produces 10 routes. Re-verified from this branch in Gate 4.

## Health Endpoint

`GET /api/health` → `{"status":"ok","service":"nbcc-student-services-navigator","version":"0.1.0","timestamp":"..."}`.

## Known Limitations (Carried Forward, Not Re-Litigated)

From `learning-log/DAY_04.md`, still current and unchanged by this increment:

1. **No stemming or word-form normalization** — e.g. "sexually"/"assaulted" do not match
   corpus forms "sexual"/"assault".
2. **Corpus-scaling limitation of exclusive-term weighting** — the document-frequency
   exclusive-term bonus becomes a coarser signal as more curated sources are added.
3. **GQ-02 retrieval fragility** — currently resolves correctly only via generic terms
   ("nbcc", "resources"), not its actual topical term ("anxious"), due to the same
   stemming gap.
4. **No real-data or live-workflow validation** — every result to date is against public
   source content and synthetic/demonstration queries; no real student has used this
   system, and no institutional workflow has been observed.

**New limitation surfaced by this increment** (see above): 5. **Two of seven approved
sources are uncurated** — NBCC-SS-004 (accessibility) and NBCC-SS-006 (financial support)
exist in the approved catalogue but have no curated content, so `financial_support` and
`accessibility_inclusion` journeys are proven correct at the routing-logic level only, not
end-to-end over live retrieval. See [`service-resolution-traces.md`](service-resolution-traces.md).
