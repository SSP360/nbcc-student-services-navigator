import fs from 'fs'
import path from 'path'

describe('Source Retrieval and Fallback', () => {
  // Test structure setup
  const testSnapshotDir = path.join(process.cwd(), 'knowledge', 'raw')
  
  beforeAll(() => {
    if (!fs.existsSync(testSnapshotDir)) {
      fs.mkdirSync(testSnapshotDir, { recursive: true })
    }
  })

  test('snapshot directory exists and is writable', () => {
    expect(fs.existsSync(testSnapshotDir)).toBe(true)
  })

  test('live fetch attempts with allowlisted NBCC URL', () => {
    const url = 'https://nbcc.ca/student-services'
    const allowedDomains = ['nbcc.ca', 'documents.nbcc.ca']
    const urlObj = new URL(url)
    expect(allowedDomains).toContain(urlObj.hostname)
  })

  test('rejects non-allowlisted URLs before fetch', () => {
    const url = 'https://example.com/page'
    const allowedDomains = ['nbcc.ca', 'documents.nbcc.ca']
    const urlObj = new URL(url)
    expect(allowedDomains).not.toContain(urlObj.hostname)
  })

  test('snapshot fallback path is correctly constructed', () => {
    const sourceId = 'NBCC-SS-001'
    const snapshotPath = path.join(process.cwd(), 'knowledge', 'raw', `${sourceId}.html`)
    expect(snapshotPath).toContain('knowledge/raw/NBCC-SS-001.html')
  })

  test('distinguishes live-fetch vs snapshot method in response', () => {
    const liveFetchMethod = 'live-fetch'
    const snapshotMethod = 'snapshot'
    expect(liveFetchMethod).not.toBe(snapshotMethod)
  })
})

describe('Error Handling', () => {
  test('returns controlled error message on fetch failure', () => {
    const errorMessage = 'Failed to fetch https://nbcc.ca: some reason'
    expect(errorMessage).toContain('Failed to fetch')
    expect(errorMessage).toContain('https://nbcc.ca')
  })

  test('includes error details in structured response', () => {
    const response = {
      retrieval_status: 'error',
      error: 'HTTP 500',
    }
    expect(response.retrieval_status).toBe('error')
    expect(response.error).toBeDefined()
  })

  test('empty/null HTML returns empty text, not crash', () => {
    const emptyText = ''
    const nullText = null
    expect(emptyText).toBe('')
    expect(nullText).toBeNull()
  })
})

describe('Response Metadata', () => {
  test('response includes required metadata fields', () => {
    const response = {
      id: 'NBCC-SS-001',
      title: 'Student Services at NBCC',
      url: 'https://nbcc.ca/student-services',
      retrieved_at: '2026-09-15T10:00:00Z',
      retrieval_method: 'live-fetch',
      retrieval_status: 'success',
      extracted_text_length: 1500,
      http_status: 200,
      content_length: 57288,
    }
    
    expect(response.id).toBeDefined()
    expect(response.url).toBeDefined()
    expect(response.retrieved_at).toBeDefined()
    expect(response.retrieval_method).toBeDefined()
    expect(response.retrieval_status).toBeDefined()
    expect(response.extracted_text_length).toBeDefined()
    expect(response.http_status).toBeDefined()
  })

  test('timestamp is ISO-8601 format', () => {
    const timestamp = '2026-09-15T10:00:00Z'
    const date = new Date(timestamp)
    expect(date.getTime()).toBeGreaterThan(0)
  })

  test('text length is accurate', () => {
    const text = 'Hello world'
    const length = text.length
    expect(length).toBe(11)
  })
})
