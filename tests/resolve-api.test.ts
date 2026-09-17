import { NextRequest } from 'next/server'
import { GET } from '@/app/api/resolve/route'

function makeRequest(params: string): NextRequest {
  return new NextRequest(`http://localhost/api/resolve?${params}`)
}

describe('/api/resolve — production-safe resolution endpoint', () => {
  test('returns 400 when neither category nor question is provided', async () => {
    const response = await GET(makeRequest(''))
    expect(response.status).toBe(400)
  })

  test('returns 400 for an unknown category', async () => {
    const response = await GET(makeRequest('category=not_a_real_category'))
    expect(response.status).toBe(400)
  })

  test('a category selection resolves without free text (F-01)', async () => {
    const response = await GET(makeRequest('category=academic_support'))
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.state).toBe('confident_route')
    expect(data.journey).toBe('academic_support')
  })

  test('the urgent category always resolves to safety_escalation (F-16)', async () => {
    const response = await GET(makeRequest('category=urgent'))
    const data = await response.json()
    expect(data.state).toBe('safety_escalation')
  })

  test('a free-text safety query resolves to safety_escalation (F-11)', async () => {
    const response = await GET(makeRequest('q=' + encodeURIComponent('I was sexually assaulted')))
    const data = await response.json()
    expect(data.state).toBe('safety_escalation')
    expect(data).not.toHaveProperty('score')
    expect(data).not.toHaveProperty('matchedTerms')
  })

  test('recovery=true never dead-ends (F-18)', async () => {
    const response = await GET(makeRequest('recovery=true'))
    const data = await response.json()
    expect(data.state).toBe('guided_choice')
    expect(data.options.length).toBeGreaterThan(0)
  })

  test('the student-card query is unsupported_query, never academic_support (F-12)', async () => {
    const response = await GET(makeRequest('q=' + encodeURIComponent('How do I get a replacement student card?')))
    const data = await response.json()
    expect(data.state).toBe('unsupported_query')
    expect(data.journey).not.toBe('academic_support')
  })
})
