import { NextRequest } from 'next/server'
import { GET } from '@/app/api/navigate/route'

function makeRequest(query: string): NextRequest {
  return new NextRequest(`http://localhost/api/navigate?q=${encodeURIComponent(query)}`)
}

describe('/api/navigate — production-safe learner endpoint', () => {
  test('returns 400 when no question is provided', async () => {
    const response = await GET(makeRequest(''))
    expect(response.status).toBe(400)
  })

  test('GQ-04 wording escalates to Wellness and Counselling with a plain-language reason', async () => {
    const response = await GET(makeRequest('Is there support for sexual violence or assault on campus?'))
    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.journey).toBe('wellbeing_safety')
    expect(data.escalation.should_escalate).toBe(true)
    expect(data.escalation.trigger).toBe('crisis_or_safety')
    expect(data.escalation.target.id).toBe('NBCC-SS-005')
    expect(data.showImmediateDangerNotice).toBe(true)
    // Learner-safe shape: no raw internals (scores, matched_terms) leaked.
    expect(data).not.toHaveProperty('matched_terms')
    expect(data).not.toHaveProperty('score')
  })

  test('an academic question returns a source with no escalation', async () => {
    const response = await GET(makeRequest('How can a Student Success Coach help me transition to college life?'))
    const data = await response.json()

    expect(data.journey).toBe('academic_support')
    expect(data.hasSource).toBe(true)
    expect(data.source.id).toBe('NBCC-SS-002')
    expect(data.escalation.should_escalate).toBe(false)
    expect(data.showImmediateDangerNotice).toBe(false)
  })

  test('an accessibility accommodation question escalates to NBCC-SS-004', async () => {
    const response = await GET(makeRequest('How do I get academic accommodations if I have a disability or learning barrier?'))
    const data = await response.json()

    expect(data.journey).toBe('accessibility_inclusion')
    expect(data.escalation.should_escalate).toBe(true)
    expect(data.escalation.trigger).toBe('accommodation_request')
    expect(data.escalation.target.id).toBe('NBCC-SS-004')
  })

  test('a financial-loan question escalates to the named financial contact', async () => {
    const response = await GET(makeRequest('Do I qualify for a loan approval this semester?'))
    const data = await response.json()

    expect(data.escalation.should_escalate).toBe(true)
    expect(data.escalation.target.id).toBe('NBCC-SS-007')
  })

  test('an unmatched query returns no source and offers general contact (no fabricated answer)', async () => {
    const response = await GET(makeRequest('zzqx unrelated gibberish query with no keyword overlap'))
    const data = await response.json()

    expect(data.hasSource).toBe(false)
    expect(data.source).toBeNull()
    expect(data.escalation.should_escalate).toBe(true)
    expect(data.escalation.trigger).toBe('unmatched_query')
    expect(data.escalation.target.id).toBe('NBCC-SS-007')
    expect(data.why).toMatch(/none of our approved/i)
    // Regression: target title "Contact NBCC" must not double up into
    // "Contact Contact NBCC directly...".
    expect(data.whatToDoNext).not.toMatch(/contact contact/i)
  })
})
