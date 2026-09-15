import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'

describe('/api/health endpoint', () => {
  test('returns 200 status', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
  })

  test('returns valid health response JSON', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('service')
    expect(data).toHaveProperty('version')
    expect(data).toHaveProperty('timestamp')
  })

  test('status is "ok"', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  test('service name is correct', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data.service).toBe('nbcc-student-services-navigator')
  })

  test('version is a string', async () => {
    const response = await GET()
    const data = await response.json()
    expect(typeof data.version).toBe('string')
    expect(data.version.length).toBeGreaterThan(0)
  })

  test('timestamp is ISO-8601 format', async () => {
    const response = await GET()
    const data = await response.json()
    const timestamp = new Date(data.timestamp)
    expect(timestamp.getTime()).toBeGreaterThan(0)
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })
})
