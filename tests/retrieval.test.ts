import { searchCuratedSources } from '@/lib/retrieval'
import { CuratedSource } from '@/lib/curated-sources'
import { loadAllCuratedSources } from '@/lib/curated-sources'

function makeSource(overrides: Partial<CuratedSource>): CuratedSource {
  return {
    source_id: 'NBCC-SS-TEST',
    title: 'Test Source',
    url: 'https://nbcc.ca/test',
    domain: 'general_student_services',
    campuses: ['all'],
    language: 'en',
    source_type: 'webpage',
    authority: 'nbcc_public',
    review_status: 'prototype_public_source',
    retrieval_timestamp: '2026-09-15T12:00:00.000Z',
    retrieval_method: 'live-fetch',
    http_status: 200,
    content_length: 100,
    extracted_text: 'Some generic body text about NBCC services.',
    retrieval_error: null,
    ...overrides,
  }
}

describe('searchCuratedSources — deterministic scoring', () => {
  const wellness = makeSource({
    source_id: 'NBCC-SS-005',
    title: 'Wellness and Counselling',
    domain: 'wellbeing',
    extracted_text: 'We offer counselling support for anxiety and mental health concerns.',
  })

  const academic = makeSource({
    source_id: 'NBCC-SS-002',
    title: 'Student Success Coaching',
    domain: 'academic_support',
    extracted_text: 'A Student Success Coach helps you transition to college life and reach your goals.',
  })

  const general = makeSource({
    source_id: 'NBCC-SS-001',
    title: 'Student Services at NBCC',
    domain: 'general_student_services',
    extracted_text: 'NBCC offers many student services including coaching and counselling.',
  })

  const corpus = [wellness, academic, general]

  test('returns empty array for a query with no matching terms', () => {
    const results = searchCuratedSources('zzzznonexistentqueryterm', corpus)
    expect(results).toEqual([])
  })

  test('returns empty array for an empty or stopword-only query', () => {
    expect(searchCuratedSources('', corpus)).toEqual([])
    expect(searchCuratedSources('the and of', corpus)).toEqual([])
  })

  test('ranks the most relevant source first for a distinctive term', () => {
    const results = searchCuratedSources('anxiety', corpus)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].source_id).toBe('NBCC-SS-005')
  })

  test('title matches score higher than body-only matches', () => {
    // "wellness" appears in the wellness source's TITLE, and nowhere else.
    const results = searchCuratedSources('wellness', corpus)
    expect(results[0].source_id).toBe('NBCC-SS-005')
    expect(results[0].matched_terms[0].inTitle).toBe(true)
  })

  test('domain match contributes to score and is reported', () => {
    const results = searchCuratedSources('academic', corpus)
    const academicResult = results.find((r) => r.source_id === 'NBCC-SS-002')
    expect(academicResult).toBeDefined()
    expect(academicResult!.matched_terms.some((m) => m.inDomain)).toBe(true)
  })

  test('every result explains which terms matched (matched_terms non-empty)', () => {
    const results = searchCuratedSources('coach transition', corpus)
    results.forEach((r) => {
      expect(r.matched_terms.length).toBeGreaterThan(0)
    })
  })

  test('every result includes a source_id traceable to the corpus and a snippet', () => {
    const results = searchCuratedSources('counselling', corpus)
    results.forEach((r) => {
      expect(corpus.some((c) => c.source_id === r.source_id)).toBe(true)
      expect(typeof r.snippet).toBe('string')
    })
  })

  test('results are sorted by descending score', () => {
    const results = searchCuratedSources('coaching counselling student', corpus)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  test('query is case-insensitive', () => {
    const lower = searchCuratedSources('anxiety', corpus)
    const upper = searchCuratedSources('ANXIETY', corpus)
    expect(upper.map((r) => r.source_id)).toEqual(lower.map((r) => r.source_id))
  })
})

describe('searchCuratedSources — real curated corpus', () => {
  test('loads and searches the real on-disk curated corpus without error', () => {
    const corpus = loadAllCuratedSources()
    const results = searchCuratedSources('counselling', corpus)
    expect(Array.isArray(results)).toBe(true)
    expect(results.some((r) => r.source_id === 'NBCC-SS-005')).toBe(true)
  })
})
