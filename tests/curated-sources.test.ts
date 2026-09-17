import {
  loadCuratedSourceIds,
  loadCuratedSource,
  loadAllCuratedSources,
  validateCuratedSource,
  validateCuratedCorpus,
  traceCuratedSourceToCatalogue,
  MIN_CONTENT_LENGTH,
  CuratedSource,
} from '@/lib/curated-sources'
import { getAllSources } from '@/lib/sources'

describe('Curated Source Corpus — File Presence', () => {
  test('exactly five curated source files exist (P0: NBCC-SS-004 and NBCC-SS-006 curated)', () => {
    const ids = loadCuratedSourceIds()
    expect(ids.length).toBe(5)
  })

  test('NBCC-SS-004 (Accessibility) and NBCC-SS-006 (Financial) are included in the curated corpus', () => {
    const ids = loadCuratedSourceIds()
    expect(ids).toContain('NBCC-SS-004')
    expect(ids).toContain('NBCC-SS-006')
  })

  test('NBCC-SS-001 is included in the curated corpus', () => {
    const ids = loadCuratedSourceIds()
    expect(ids).toContain('NBCC-SS-001')
  })

  test('all curated files load without error', () => {
    const ids = loadCuratedSourceIds()
    for (const id of ids) {
      expect(() => loadCuratedSource(id)).not.toThrow()
    }
  })
})

describe('Curated Source Corpus — Required Metadata', () => {
  let sources: CuratedSource[]

  beforeAll(() => {
    sources = loadAllCuratedSources()
  })

  test('every record has a unique source_id', () => {
    const ids = sources.map((s) => s.source_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('every record has a title', () => {
    sources.forEach((s) => expect(s.title).toBeTruthy())
  })

  test('every record has an HTTPS url', () => {
    sources.forEach((s) => expect(s.url).toMatch(/^https:\/\//))
  })

  test('every record has a domain', () => {
    sources.forEach((s) => expect(s.domain).toBeTruthy())
  })

  test('every record has campus applicability', () => {
    sources.forEach((s) => expect(Array.isArray(s.campuses) && s.campuses.length > 0).toBe(true))
  })

  test('every record has a language', () => {
    sources.forEach((s) => expect(s.language).toBeTruthy())
  })

  test('every record has an ISO-8601 retrieval_timestamp', () => {
    sources.forEach((s) => {
      const parsed = new Date(s.retrieval_timestamp)
      expect(isNaN(parsed.getTime())).toBe(false)
    })
  })

  test('every record has a retrieval_method of live-fetch or snapshot', () => {
    sources.forEach((s) => expect(['live-fetch', 'snapshot']).toContain(s.retrieval_method))
  })

  test('every record has a review_status', () => {
    sources.forEach((s) => expect(s.review_status).toBeTruthy())
  })

  test('every record has non-empty readable extracted_text', () => {
    sources.forEach((s) => expect(s.extracted_text.trim().length).toBeGreaterThan(0))
  })

  test('every record meets the minimum usable content threshold', () => {
    sources.forEach((s) => expect(s.extracted_text.length).toBeGreaterThanOrEqual(MIN_CONTENT_LENGTH))
  })
})

describe('Curated Source Corpus — Provenance Traceability', () => {
  test('every curated record traces back to knowledge/sources.yaml', () => {
    const catalogue = getAllSources()
    const curated = loadAllCuratedSources()

    curated.forEach((c) => {
      const traced = traceCuratedSourceToCatalogue(c, catalogue)
      expect(traced).toBe(true)
    })
  })
})

describe('validateCuratedSource — Detects Defects', () => {
  const validRecord: CuratedSource = {
    source_id: 'NBCC-SS-999',
    title: 'Test Source',
    url: 'https://nbcc.ca/test-page',
    domain: 'general_student_services',
    campuses: ['all'],
    language: 'en',
    source_type: 'webpage',
    authority: 'nbcc_public',
    review_status: 'prototype_public_source',
    retrieval_timestamp: '2026-09-15T12:00:00.000Z',
    retrieval_method: 'live-fetch',
    http_status: 200,
    content_length: 600,
    extracted_text: 'x'.repeat(600),
    retrieval_error: null,
  }

  test('accepts a fully valid record', () => {
    expect(validateCuratedSource(validRecord)).toEqual([])
  })

  test('detects missing required metadata (title)', () => {
    const record = { ...validRecord, title: '' }
    const issues = validateCuratedSource(record)
    expect(issues.some((i) => i.toLowerCase().includes('title'))).toBe(true)
  })

  test('detects missing required metadata (domain)', () => {
    const record = { ...validRecord, domain: undefined }
    const issues = validateCuratedSource(record)
    expect(issues.some((i) => i.toLowerCase().includes('domain'))).toBe(true)
  })

  test('detects empty extracted text', () => {
    const record = { ...validRecord, extracted_text: '' }
    const issues = validateCuratedSource(record)
    expect(issues.some((i) => i.toLowerCase().includes('empty'))).toBe(true)
  })

  test('detects invalid URL', () => {
    const record = { ...validRecord, url: 'not-a-url' }
    const issues = validateCuratedSource(record)
    expect(issues.some((i) => i.toLowerCase().includes('invalid url'))).toBe(true)
  })

  test('detects URL outside the approved NBCC allowlist', () => {
    const record = { ...validRecord, url: 'https://example.com/student-services' }
    const issues = validateCuratedSource(record)
    expect(issues.some((i) => i.toLowerCase().includes('allowlist'))).toBe(true)
  })

  test('detects non-HTTPS URL', () => {
    const record = { ...validRecord, url: 'http://nbcc.ca/student-services' }
    const issues = validateCuratedSource(record)
    expect(issues.some((i) => i.toLowerCase().includes('https'))).toBe(true)
  })

  test('detects unusably short content', () => {
    const record = { ...validRecord, extracted_text: 'too short', content_length: 9 }
    const issues = validateCuratedSource(record)
    expect(issues.some((i) => i.toLowerCase().includes('minimum usable length'))).toBe(true)
  })

  test('detects invalid retrieval_method', () => {
    const record = { ...validRecord, retrieval_method: 'guess' as unknown as CuratedSource['retrieval_method'] }
    const issues = validateCuratedSource(record)
    expect(issues.some((i) => i.toLowerCase().includes('retrieval_method'))).toBe(true)
  })

  test('detects non-ISO-8601 retrieval_timestamp', () => {
    const record = { ...validRecord, retrieval_timestamp: 'not-a-date' }
    const issues = validateCuratedSource(record)
    expect(issues.some((i) => i.toLowerCase().includes('iso-8601'))).toBe(true)
  })
})

describe('validateCuratedCorpus — Cross-Record Checks', () => {
  const base: CuratedSource = {
    source_id: 'NBCC-SS-100',
    title: 'A',
    url: 'https://nbcc.ca/a',
    domain: 'general_student_services',
    campuses: ['all'],
    language: 'en',
    source_type: 'webpage',
    authority: 'nbcc_public',
    review_status: 'prototype_public_source',
    retrieval_timestamp: '2026-09-15T12:00:00.000Z',
    retrieval_method: 'live-fetch',
    http_status: 200,
    content_length: 600,
    extracted_text: 'x'.repeat(600),
    retrieval_error: null,
  }

  test('detects duplicate source IDs across records', () => {
    const dup = { ...base }
    const issues = validateCuratedCorpus([base, dup])
    expect(issues.some((i) => i.issue.includes('Duplicate source_id'))).toBe(true)
  })

  test('reports no issues for a valid, unique corpus', () => {
    const second = { ...base, source_id: 'NBCC-SS-101', url: 'https://nbcc.ca/b' }
    const issues = validateCuratedCorpus([base, second])
    expect(issues).toEqual([])
  })

  test('the real curated corpus on disk has zero validation issues', () => {
    const curated = loadAllCuratedSources()
    const issues = validateCuratedCorpus(curated)
    expect(issues).toEqual([])
  })
})
