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

describe('/api/resolve — internal errors never leak to the client (C-07)', () => {
  test('a thrown internal error produces a generic, safe message, not the raw exception text', async () => {
    jest.resetModules()
    jest.doMock('@/lib/resolution/engine', () => ({
      resolveFreeText: () => {
        throw new Error('Approved source NBCC-SS-999 has no P0.2 lifecycle record (see docs/SOURCE_ONBOARDING.md)')
      },
      resolveCategory: jest.fn(),
      resolveRecovery: jest.fn(),
    }))
    const { GET: mockedGet } = require('@/app/api/resolve/route')
    const response = await mockedGet(makeRequest('q=anything'))
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.error).not.toMatch(/NBCC-SS-999|SOURCE_ONBOARDING|lifecycle record/)
    jest.dontMock('@/lib/resolution/engine')
    jest.resetModules()
  })
})
