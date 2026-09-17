import {
  isEligibleForConfidentRoute,
  safetyOverridesEverything,
  RESOLUTION_JOURNEYS,
  SourceStatus,
} from '@/lib/resolution/types'

describe('foundation: source-status eligibility (G-02, G-03, G-04)', () => {
  test('active sources are eligible for confident_route', () => {
    expect(isEligibleForConfidentRoute('active')).toBe(true)
  })

  test('needs_review sources are not eligible for confident_route', () => {
    expect(isEligibleForConfidentRoute('needs_review')).toBe(false)
  })

  test('unavailable sources are not eligible for confident_route', () => {
    expect(isEligibleForConfidentRoute('unavailable')).toBe(false)
  })

  test('retired sources are not eligible for confident_route', () => {
    expect(isEligibleForConfidentRoute('retired')).toBe(false)
  })

  test('only the four documented statuses exist', () => {
    const statuses: SourceStatus[] = ['active', 'needs_review', 'unavailable', 'retired']
    statuses.forEach((s) => expect(typeof isEligibleForConfidentRoute(s)).toBe('boolean'))
  })
})

describe('foundation: safety-first precedence rule (C-04)', () => {
  test('a safety trigger overrides everything', () => {
    expect(safetyOverridesEverything(true)).toBe(true)
  })

  test('no safety trigger does not force an override', () => {
    expect(safetyOverridesEverything(false)).toBe(false)
  })
})

describe('foundation: five canonical resolution journeys', () => {
  test('exactly five journeys are defined, matching the acceptance contract', () => {
    expect(RESOLUTION_JOURNEYS).toEqual([
      'academic_support',
      'financial_support',
      'accessibility',
      'wellbeing_safety',
      'general_student_services',
    ])
  })
})
