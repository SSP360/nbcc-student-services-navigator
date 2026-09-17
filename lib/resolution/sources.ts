import { getAllSources } from '../sources'
import { ApprovedSourceMeta, ResolutionJourney, SourceStatus, isEligibleForConfidentRoute } from './types'

/**
 * P0.2 content-lifecycle layer over the existing approved-source catalogue
 * (knowledge/sources.yaml, loaded via lib/sources.ts's getAllSources() —
 * already validated against the HTTPS/allowlist rules in lib/types.ts).
 *
 * This module adds no new sources (G-06: sources outside the approved
 * allowlist cannot be added or recommended — there is no code path here
 * that can introduce one, since everything is derived from
 * getAllSources()). It only adds the lifecycle fields
 * (journey/status/owner/lastReviewedAt) the resolution contract requires
 * (G-01) that knowledge/sources.yaml does not track today.
 */

const DOMAIN_TO_RESOLUTION_JOURNEY: Record<string, ResolutionJourney> = {
  general_student_services: 'general_student_services',
  academic_support: 'academic_support',
  accessibility: 'accessibility',
  wellbeing: 'wellbeing_safety',
  financial_support: 'financial_support',
  // Contact NBCC is the general/human contact route for every journey when
  // nothing more specific applies — mapped to general_student_services.
  contact_routing: 'general_student_services',
}

interface LifecycleRecord {
  status: SourceStatus
  owner: string
  lastReviewedAt: string
  reviewDueBy?: string
}

/**
 * Lifecycle metadata for each of the 7 approved sources in
 * knowledge/sources.yaml. `NBCC-SS-003` (PASS Guideline) is a PDF document
 * that has never been curated into `knowledge/curated/` (see
 * docs/design-partner-readiness/evidence-inventory.md) — it is marked
 * `needs_review` rather than `active` because its extraction path has not
 * been validated, which is the documented, deterministic G-05 behaviour
 * this file exists to test: a `needs_review` source is excluded from
 * `confident_route` exactly like `unavailable`/`retired` (see
 * `isEligibleForConfidentRoute`), and P0.1's engine falls back to
 * `human_assisted` for academic_support queries that would otherwise have
 * relied on it alone (documented in docs/SOURCE_COVERAGE_MATRIX.md).
 *
 * Every other source is `active`: all six of NBCC-SS-001/002/004/005/006/007
 * are live, publicly reachable pages, verified during curation or direct use
 * by lib/escalation.ts's hardcoded contact targets.
 */
const LIFECYCLE: Record<string, LifecycleRecord> = {
  'NBCC-SS-001': { status: 'active', owner: 'Student Services (General)', lastReviewedAt: '2026-09-15' },
  'NBCC-SS-002': { status: 'active', owner: 'Student Success Coaching', lastReviewedAt: '2026-09-15' },
  'NBCC-SS-003': {
    status: 'needs_review',
    owner: 'Academic Support (PASS)',
    lastReviewedAt: '2026-09-15',
    reviewDueBy: '2026-12-15',
  },
  'NBCC-SS-004': { status: 'active', owner: 'Accessibility and Inclusion Services', lastReviewedAt: '2026-09-17' },
  'NBCC-SS-005': { status: 'active', owner: 'Wellness and Counselling', lastReviewedAt: '2026-09-15' },
  'NBCC-SS-006': { status: 'active', owner: 'Financial Aid / Student Financial Support', lastReviewedAt: '2026-09-17' },
  'NBCC-SS-007': { status: 'active', owner: 'Contact NBCC (General Enquiries)', lastReviewedAt: '2026-09-15' },
}

let cached: ApprovedSourceMeta[] | null = null

/**
 * Loads every approved source with its P0.2 lifecycle metadata attached.
 * Throws if an approved source in knowledge/sources.yaml has no lifecycle
 * record — a fail-closed guard so a future source added to the catalogue
 * without going through the onboarding checklist
 * (docs/SOURCE_ONBOARDING.md) cannot silently become eligible for
 * confident routing with undefined status.
 */
export function loadApprovedSourceMeta(): ApprovedSourceMeta[] {
  if (cached) return cached

  const sources = getAllSources()
  cached = sources.map((s) => {
    const journey = DOMAIN_TO_RESOLUTION_JOURNEY[s.domain]
    const lifecycle = LIFECYCLE[s.id]
    if (!journey) {
      throw new Error(`Approved source ${s.id} has domain "${s.domain}" with no resolution-journey mapping`)
    }
    if (!lifecycle) {
      throw new Error(`Approved source ${s.id} has no P0.2 lifecycle record (see docs/SOURCE_ONBOARDING.md)`)
    }
    return {
      id: s.id,
      journey,
      title: s.title,
      url: s.url,
      owner: lifecycle.owner,
      status: lifecycle.status,
      lastReviewedAt: lifecycle.lastReviewedAt,
      reviewDueBy: lifecycle.reviewDueBy,
    }
  })
  return cached
}

/** All approved sources for a journey, regardless of status. */
export function getSourcesForJourney(journey: ResolutionJourney): ApprovedSourceMeta[] {
  return loadApprovedSourceMeta().filter((s) => s.journey === journey)
}

/** Only the sources for a journey eligible to back a confident_route (G-03, G-04). */
export function getActiveSourcesForJourney(journey: ResolutionJourney): ApprovedSourceMeta[] {
  return getSourcesForJourney(journey).filter((s) => isEligibleForConfidentRoute(s.status))
}

export function getApprovedSourceById(id: string): ApprovedSourceMeta | undefined {
  return loadApprovedSourceMeta().find((s) => s.id === id)
}
