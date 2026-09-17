import {
  loadApprovedSourceMeta,
  getSourcesForJourney,
  getActiveSourcesForJourney,
  getApprovedSourceById,
} from '@/lib/resolution/sources'
import { isEligibleForConfidentRoute, ApprovedSourceMeta, RESOLUTION_JOURNEYS } from '@/lib/resolution/types'

describe('G-01: every approved source has required metadata', () => {
  const sources = loadApprovedSourceMeta()

  test('at least the 7 catalogued sources are present', () => {
    expect(sources.length).toBeGreaterThanOrEqual(7)
  })

  sources.forEach((s) => {
    test(`${s.id} has id, journey, title, HTTPS URL, owner, status, and last-reviewed date`, () => {
      expect(s.id).toBeTruthy()
      expect(RESOLUTION_JOURNEYS).toContain(s.journey)
      expect(s.title).toBeTruthy()
      expect(s.url).toMatch(/^https:\/\//)
      expect(s.owner).toBeTruthy()
      expect(['active', 'needs_review', 'unavailable', 'retired']).toContain(s.status)
      expect(new Date(s.lastReviewedAt).toString()).not.toBe('Invalid Date')
    })
  })
})

describe('G-06: no source outside the approved allowlist can be loaded', () => {
  test('every URL resolves to the nbcc.ca allowlist (reuses lib/types.ts ALLOWED_DOMAINS via lib/sources.ts validation)', () => {
    const sources = loadApprovedSourceMeta()
    sources.forEach((s) => {
      const hostname = new URL(s.url).hostname
      expect(['nbcc.ca', 'documents.nbcc.ca']).toContain(hostname)
    })
  })

  test('getApprovedSourceById returns undefined for an unapproved/invented ID', () => {
    expect(getApprovedSourceById('NBCC-SS-999-INVENTED')).toBeUndefined()
  })
})

describe('G-03 / G-04: retired and unavailable sources are excluded from confident routing', () => {
  // Synthetic fixtures: the real approved catalogue currently has no
  // retired or unavailable source, so this test exercises the exclusion
  // rule directly rather than relying on real data that does not exist
  // today (see docs/SOURCE_COVERAGE_MATRIX.md for the real-source status
  // table).
  const retired: ApprovedSourceMeta = {
    id: 'TEST-RETIRED',
    journey: 'academic_support',
    title: 'Retired test source',
    url: 'https://nbcc.ca/retired-test',
    owner: 'Test',
    status: 'retired',
    lastReviewedAt: '2020-01-01',
  }
  const unavailable: ApprovedSourceMeta = { ...retired, id: 'TEST-UNAVAILABLE', status: 'unavailable' }
  const active: ApprovedSourceMeta = { ...retired, id: 'TEST-ACTIVE', status: 'active' }

  test('retired sources are not eligible for confident_route', () => {
    expect(isEligibleForConfidentRoute(retired.status)).toBe(false)
  })

  test('unavailable sources are not eligible for confident_route', () => {
    expect(isEligibleForConfidentRoute(unavailable.status)).toBe(false)
  })

  test('active sources are eligible for confident_route', () => {
    expect(isEligibleForConfidentRoute(active.status)).toBe(true)
  })

  test('a fixture list filters out retired/unavailable sources from an active-only view', () => {
    const fixtureList = [retired, unavailable, active]
    const activeOnly = fixtureList.filter((s) => isEligibleForConfidentRoute(s.status))
    expect(activeOnly).toEqual([active])
  })
})

describe('G-05: needs_review behaviour is explicit, deterministic, and tested', () => {
  test('NBCC-SS-003 (PASS Guideline, an uncurated PDF) is needs_review, not active', () => {
    const source = getApprovedSourceById('NBCC-SS-003')
    expect(source).toBeDefined()
    expect(source!.status).toBe('needs_review')
  })

  test('needs_review sources are excluded from the active-sources-for-journey view', () => {
    const activeAcademic = getActiveSourcesForJourney('academic_support')
    expect(activeAcademic.find((s) => s.id === 'NBCC-SS-003')).toBeUndefined()
  })

  test('academic_support still has at least one active source despite NBCC-SS-003 being needs_review', () => {
    // This is the "safe fallback exists when status prevents ordinary
    // routing" requirement at the data layer: academic_support is not left
    // with zero active sources just because one of its two approved
    // sources needs review.
    const activeAcademic = getActiveSourcesForJourney('academic_support')
    expect(activeAcademic.length).toBeGreaterThanOrEqual(1)
    expect(activeAcademic.some((s) => s.id === 'NBCC-SS-002')).toBe(true)
  })
})

describe('preservation of five supported journeys', () => {
  RESOLUTION_JOURNEYS.forEach((journey) => {
    test(`${journey} has at least one approved source`, () => {
      expect(getSourcesForJourney(journey).length).toBeGreaterThanOrEqual(1)
    })

    test(`${journey} has at least one ACTIVE approved source (confident routing is possible)`, () => {
      expect(getActiveSourcesForJourney(journey).length).toBeGreaterThanOrEqual(1)
    })
  })
})
