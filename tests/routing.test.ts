import { routeQuery, JOURNEYS } from '@/lib/routing'
import { RetrievalResult } from '@/lib/retrieval'

function makeResult(overrides: Partial<RetrievalResult>): RetrievalResult {
  return {
    source_id: 'NBCC-SS-TEST',
    title: 'Test Source',
    url: 'https://nbcc.ca/test',
    domain: 'general_student_services',
    score: 10,
    matched_terms: [{ term: 'test', inTitle: true, inDomain: false, bodyOccurrences: 0 }],
    snippet: '',
    ...overrides,
  }
}

describe('routeQuery — domain-to-journey mapping', () => {
  test('maps academic_support domain to academic_support journey', () => {
    const result = routeQuery('coach', [makeResult({ domain: 'academic_support' })])
    expect(result.journey).toBe('academic_support')
  })

  test('maps wellbeing domain to wellbeing_safety journey', () => {
    const result = routeQuery('counselling', [makeResult({ domain: 'wellbeing' })])
    expect(result.journey).toBe('wellbeing_safety')
  })

  test('maps accessibility domain to accessibility_inclusion journey', () => {
    const result = routeQuery('accommodation', [makeResult({ domain: 'accessibility' })])
    expect(result.journey).toBe('accessibility_inclusion')
  })

  test('maps financial_support domain to financial_support journey', () => {
    const result = routeQuery('loans', [makeResult({ domain: 'financial_support' })])
    expect(result.journey).toBe('financial_support')
  })

  test('maps general_student_services domain to general_contact journey', () => {
    const result = routeQuery('services', [makeResult({ domain: 'general_student_services' })])
    expect(result.journey).toBe('general_contact')
  })

  test('maps contact_routing domain to general_contact journey', () => {
    const result = routeQuery('contact', [makeResult({ domain: 'contact_routing' })])
    expect(result.journey).toBe('general_contact')
  })

  test('unrecognized domain falls back to general_contact', () => {
    const result = routeQuery('x', [makeResult({ domain: 'some_new_unmapped_domain' })])
    expect(result.journey).toBe('general_contact')
  })
})

describe('routeQuery — no-match fallback', () => {
  test('empty retrieval results route to general_contact with an explanatory reason', () => {
    const result = routeQuery('zzznonexistentterm', [])
    expect(result.journey).toBe('general_contact')
    expect(result.top_result).toBeNull()
    expect(result.reason.length).toBeGreaterThan(0)
  })
})

describe('routeQuery — uses the top-scoring result', () => {
  test('picks the highest-scoring result when multiple are present', () => {
    const low = makeResult({ source_id: 'A', domain: 'wellbeing', score: 5 })
    const high = makeResult({ source_id: 'B', domain: 'academic_support', score: 50 })
    const result = routeQuery('x', [high, low])
    expect(result.journey).toBe('academic_support')
    expect(result.top_result?.source_id).toBe('B')
  })

  test('reason cites the top source id, title, domain, and score', () => {
    const result = routeQuery('x', [makeResult({ source_id: 'NBCC-SS-002', title: 'Student Success Coaching', domain: 'academic_support', score: 42 })])
    expect(result.reason).toContain('NBCC-SS-002')
    expect(result.reason).toContain('Student Success Coaching')
    expect(result.reason).toContain('academic_support')
    expect(result.reason).toContain('42')
  })
})

describe('JOURNEYS constant', () => {
  test('defines exactly the five canonical journeys', () => {
    expect(JOURNEYS.sort()).toEqual(
      ['academic_support', 'accessibility_inclusion', 'financial_support', 'general_contact', 'wellbeing_safety'].sort()
    )
  })
})
