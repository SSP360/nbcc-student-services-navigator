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
| NBCC-SS-004 | Accessibility and Inclusion Services | `accessibility` | ✅ Yes (P0) |
| NBCC-SS-005 | Wellness and Counselling | `wellbeing` | ✅ Yes |
| NBCC-SS-006 | Student Loans | `financial_support` | ✅ Yes (P0) |
| NBCC-SS-007 | Contact NBCC | `contact_routing` | ❌ No |

**Update (P0)**: 5 of the 7 approved sources are now curated into `knowledge/curated/`.
NBCC-SS-004 and NBCC-SS-006 — flagged as an uncurated content-coverage gap in Days 5–7 —
were curated in P0 (`learning-log/P0_COVERAGE_UX.md`), closing the gap this section
originally disclosed. NBCC-SS-003 (a PDF document, not a webpage) and NBCC-SS-007
(the contact-routing page, used directly by `lib/escalation.ts`'s hardcoded targets rather
than through retrieval) remain uncurated; neither is required for any of the five
canonical journeys' informational retrieval today.

## Canonical Journeys

Defined in `lib/routing.ts` (`JOURNEYS` constant and `DOMAIN_TO_JOURNEY` map):
`academic_support`, `financial_support`, `accessibility_inclusion`, `wellbeing_safety`,
`general_contact`. All five are now demonstrated end-to-end over real curated content
(P0 closed the last two gaps); see
[`service-resolution-traces.md`](service-resolution-traces.md) for real pipeline output on
each.

## Deterministic Retrieval

`lib/retrieval.ts` — `searchCuratedSources()`. No model, embedding, or external service.
Title/domain/body keyword matching with a document-frequency exclusive-term weighting
(Day 4 fix: a term occurring in exactly one curated document's body receives a 3×
multiplier on its body contribution). Every result carries `matched_terms` showing exactly
which query terms matched, where, and whether the exclusive-term multiplier applied.
Evidence: `tests/retrieval.test.ts` (15 tests), `evals/golden_questions_results.json`
(12/12 top-1 accuracy over the real curated corpus, including GQ-11/GQ-12 added in P0 for
the newly-curated accessibility and financial sources).

## Routing and Escalation

`lib/routing.ts` — maps a matched source's `domain` to a journey with a human-readable
reason; falls back to `general_contact` when nothing matches, citing `ANSWER_POLICY.md`'s
"No Source, No Answer" rule.

`lib/escalation.ts` — implements all 6 triggers named in `policies/ESCALATION_POLICY.md`
(`crisis_or_safety`, `source_error`, `unmatched_query`, `accommodation_request`,
`personalized_decision`, `urgent_timeframe`), each a deterministic keyword or error check,
evaluated in a fixed priority order. `crisis_or_safety` and `accommodation_request` always
target `NBCC-SS-005` and `NBCC-SS-004` directly, independent of the journey/retrieval
ranking. **P0 extended this hardening to `personalized_decision`**: a financially-framed
decision query (e.g. "loan approval") now always targets the named financial contact
(`NBCC-SS-007`), closing a real misrouting risk found while curating NBCC-SS-006 (see
`tests/escalation.test.ts`, "financial personalized_decision hardening (P0)").

Evidence: `tests/routing.test.ts` (11 tests), `tests/escalation.test.ts` (27 tests),
`tests/routing-escalation-golden-questions.test.ts` (32 tests),
`evals/routing_escalation_results.json` — journey classification 12/12, escalation-trigger
accuracy 12/12, escalation-target accuracy 2/2.

## Development-Only Inspectors (Not Student-Facing)

- `/dev/sources` + `/api/dev/sources` — source catalogue and NBCC-SS-001 live-retrieval evidence.
- `/dev/retrieval` + `/api/dev/retrieval` — keyword retrieval inspector, shows matched terms and scores.
- `/dev/routing` + `/api/dev/routing` — full query → retrieval → journey → escalation pipeline inspector.

All three are gated by `process.env.NODE_ENV !== 'development'` returning `404`, verified
against a real `NODE_ENV=production` build in every prior day's learning log and
re-verified in P0 (see [`learning-log/P0_COVERAGE_UX.md`](../../learning-log/P0_COVERAGE_UX.md)).

**New in P0**: `GET /api/navigate` is a production-safe (available in every environment,
not development-only) learner-facing endpoint that wraps the same pipeline in a
plain-language, no-internal-detail response shape (`lib/navigate.ts`), used by the
homepage (`/`).

## Test Suite and Build

177 tests across 12 suites, all passing as of branch `feat/p0-five-journey-ux`.
`npm run build` produces 11 routes. Re-verified in
[`learning-log/P0_COVERAGE_UX.md`](../../learning-log/P0_COVERAGE_UX.md).

## Health Endpoint

`GET /api/health` → `{"status":"ok","service":"nbcc-student-services-navigator","version":"0.1.0","timestamp":"..."}`.

## Known Limitations (Carried Forward, Not Re-Litigated)

From `learning-log/DAY_04.md`, still current:

1. **No stemming or word-form normalization** — e.g. "sexually"/"assaulted" do not match
   corpus forms "sexual"/"assault".
2. **Corpus-scaling limitation of exclusive-term weighting** — the document-frequency
   exclusive-term bonus becomes a coarser signal as more curated sources are added. P0 hit
   this directly: adding NBCC-SS-004/006 flipped a previously-passing question (GQ-09)
   purely from added raw body-occurrence counts, requiring a curation-content fix (removing
   a repeated non-informational UI link label) rather than a retrieval-algorithm change,
   after several generic algorithmic dampening candidates were tested and rejected because
   they broke GQ-02 (limitation 3 below). See `learning-log/P0_COVERAGE_UX.md`.
3. **GQ-02 retrieval fragility** — currently resolves correctly only via generic terms
   ("nbcc", "resources"), not its actual topical term ("anxious"), due to the same
   stemming gap. This fragility is now a materially proven constraint on future retrieval
   changes (see limitation 2), not just a theoretical one.
4. **No real-data or live-workflow validation** — every result to date is against public
   source content and synthetic/demonstration queries; no real student has used this
   system, and no institutional workflow has been observed.

**Closed by P0** (previously listed here as limitation 5): all 7 approved sources are no
longer 3-of-7 curated — 5 of 7 are now curated (NBCC-SS-001, 002, 004, 005, 006). The two
that remain uncurated (NBCC-SS-003, a PDF document, and NBCC-SS-007, the contact-routing
page used directly by hardcoded escalation targets) are not required for any of the five
canonical journeys' informational retrieval.
