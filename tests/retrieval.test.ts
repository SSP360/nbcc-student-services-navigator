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

describe('searchCuratedSources — document-frequency exclusive-term weighting (Day 4 / D2-FU-01)', () => {
  // Three synthetic sources: "unique" appears only in wellness's body
  // (document frequency 1, exclusive), "shared" appears in all three
  // (document frequency 3, generic/non-discriminating).
  const wellness = makeSource({
    source_id: 'NBCC-SS-005',
    title: 'Wellness and Counselling',
    domain: 'wellbeing',
    extracted_text: 'shared shared shared shared shared unique unique unique unique unique',
  })
  const academic = makeSource({
    source_id: 'NBCC-SS-002',
    title: 'Student Success Coaching',
    domain: 'academic_support',
    extracted_text: 'shared shared shared shared shared shared shared shared shared shared shared shared',
  })
  const general = makeSource({
    source_id: 'NBCC-SS-001',
    title: 'Student Services at NBCC',
    domain: 'general_student_services',
    extracted_text: 'shared shared shared shared shared shared shared shared shared shared',
  })
  const corpus = [wellness, academic, general]

  test('a term occurring in exactly one document (document frequency 1) is flagged as exclusive and receives the 3x multiplier', () => {
    const results = searchCuratedSources('unique', corpus)
    const wellnessResult = results.find((r) => r.source_id === 'NBCC-SS-005')!
    const uniqueTerm = wellnessResult.matched_terms.find((m) => m.term === 'unique')!

    expect(uniqueTerm.documentFrequency).toBe(1)
    expect(uniqueTerm.isExclusiveTerm).toBe(true)
    // 5 occurrences * BODY_WEIGHT(1) * multiplier(3) = 15
    expect(wellnessResult.score).toBe(15)
  })

  test('a term occurring in multiple documents (document frequency > 1) is not flagged as exclusive and is not multiplied', () => {
    const results = searchCuratedSources('shared', corpus)
    const wellnessResult = results.find((r) => r.source_id === 'NBCC-SS-005')!
    const academicResult = results.find((r) => r.source_id === 'NBCC-SS-002')!
    const generalResult = results.find((r) => r.source_id === 'NBCC-SS-001')!

    for (const r of [wellnessResult, academicResult, generalResult]) {
      const sharedTerm = r.matched_terms.find((m) => m.term === 'shared')!
      expect(sharedTerm.documentFrequency).toBe(3)
      expect(sharedTerm.isExclusiveTerm).toBe(false)
    }
    // Unmultiplied: raw occurrence count * BODY_WEIGHT(1), no 3x applied.
    expect(wellnessResult.score).toBe(5)
    expect(academicResult.score).toBe(12)
    expect(generalResult.score).toBe(10)
  })

  test('an exclusive term with few raw occurrences can outrank a generic term with many raw occurrences', () => {
    // "unique" (5 occurrences, exclusive, x3 = 15) vs "shared" alone would
    // need >15 raw occurrences to beat it at weight 1 — demonstrating the
    // mechanism's real effect, not just that the flag is set correctly.
    const results = searchCuratedSources('unique', corpus)
    expect(results[0].source_id).toBe('NBCC-SS-005')
    expect(results[0].score).toBeGreaterThan(academic.extracted_text.split(' ').length)
  })

  test('document frequency is computed per query, not cached globally across unrelated queries', () => {
    // "unique" has df=1 in this corpus; a completely different term with
    // df=3 in the same corpus must not reuse a stale df value.
    const uniqueResults = searchCuratedSources('unique', corpus)
    const sharedResults = searchCuratedSources('shared', corpus)
    const uniqueDf = uniqueResults[0].matched_terms.find((m) => m.term === 'unique')!.documentFrequency
    const sharedDf = sharedResults[0].matched_terms.find((m) => m.term === 'shared')!.documentFrequency
    expect(uniqueDf).toBe(1)
    expect(sharedDf).toBe(3)
  })
})

describe('searchCuratedSources — GQ-04 regression (D2-FU-01 fix)', () => {
  test('GQ-04 retrieves NBCC-SS-005 (Wellness and Counselling) as the top result on the real curated corpus', () => {
    const corpus = loadAllCuratedSources()
    const results = searchCuratedSources('Is there support for sexual violence or assault on campus?', corpus)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].source_id).toBe('NBCC-SS-005')

    // The exclusive, safety-critical terms should be flagged as such.
    const exclusiveTerms = results[0].matched_terms.filter((m) => m.isExclusiveTerm).map((m) => m.term)
    expect(exclusiveTerms).toEqual(expect.arrayContaining(['sexual', 'violence', 'assault']))

    // The generic, corpus-wide terms should not receive the multiplier.
    const genericTerms = results[0].matched_terms.filter((m) => m.term === 'support' || m.term === 'campus')
    genericTerms.forEach((m) => expect(m.isExclusiveTerm).toBe(false))
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
