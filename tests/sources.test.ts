import { loadSources, getSourceById, getAllSources } from '@/lib/sources'

describe('Source Catalogue', () => {
  let sources: any[]

  beforeAll(() => {
    sources = loadSources()
  })

  test('loads sources from sources.yaml', () => {
    expect(Array.isArray(sources)).toBe(true)
    expect(sources.length).toBeGreaterThanOrEqual(1)
  })

  test('all source IDs are unique', () => {
    const ids = sources.map(s => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  test('all sources have required fields', () => {
    const requiredFields = [
      'id', 'title', 'url', 'domain', 'campuses', 'languages',
      'source_type', 'authority', 'retrieved_at', 'time_sensitive', 'review_status'
    ]
    sources.forEach(source => {
      requiredFields.forEach(field => {
        expect(source).toHaveProperty(field)
      })
    })
  })

  test('all URLs use HTTPS protocol', () => {
    sources.forEach(source => {
      expect(source.url).toMatch(/^https:\/\//)
    })
  })

  test('all domains are from approved list', () => {
    const allowedDomains = ['nbcc.ca', 'documents.nbcc.ca']
    sources.forEach(source => {
      const url = new URL(source.url)
      expect(allowedDomains).toContain(url.hostname)
    })
  })

  test('all authority values are valid', () => {
    const allowedAuthorities = ['nbcc_public']
    sources.forEach(source => {
      expect(allowedAuthorities).toContain(source.authority)
    })
  })

  test('all review_status values are valid', () => {
    const allowedStatus = ['prototype_public_source']
    sources.forEach(source => {
      expect(allowedStatus).toContain(source.review_status)
    })
  })

  test('NBCC-SS-001 exists in catalogue', () => {
    const nbccSS001 = getSourceById('NBCC-SS-001')
    expect(nbccSS001).toBeDefined()
    expect(nbccSS001?.id).toBe('NBCC-SS-001')
  })

  test('getSourceById returns undefined for non-existent ID', () => {
    const nonExistent = getSourceById('NONEXISTENT')
    expect(nonExistent).toBeUndefined()
  })

  test('getAllSources returns all sources', () => {
    const allSources = getAllSources()
    expect(allSources.length).toBe(sources.length)
  })
})
