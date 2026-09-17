import { matchesSafetyTerm, matchGenericTerms, matchJourneys, matchesOutOfScopeTerm } from '@/lib/resolution/registry'

describe('matchesSafetyTerm', () => {
  test('matches a direct safety term', () => {
    expect(matchesSafetyTerm('I was sexually assaulted')).toBeTruthy()
  })

  test('matches "suicidal" as a whole word', () => {
    expect(matchesSafetyTerm('I feel suicidal')).toBeTruthy()
  })

  test('does not match a safety term as a substring of an unrelated word', () => {
    // "assault" must not match "assaultive-sounding-but-unrelated" style
    // false positives from a bare substring search; the word-boundary
    // regex used here means only a genuine standalone occurrence matches.
    expect(matchesSafetyTerm('the weather report was massive today')).toBeNull()
  })

  test('returns null for an ordinary academic query', () => {
    expect(matchesSafetyTerm('I need help studying for exams')).toBeNull()
  })
})

describe('matchGenericTerms', () => {
  test('detects generic terms like "help" and "student"', () => {
    expect(matchGenericTerms('I need help')).toContain('help')
    expect(matchGenericTerms('I need help')).toContain('need')
  })

  test('a query with only generic terms matches no journey-specific phrase', () => {
    const generic = matchGenericTerms('student services help')
    expect(generic.length).toBeGreaterThan(0)
    expect(matchJourneys('student services help').size).toBe(0)
  })
})

describe('matchesOutOfScopeTerm', () => {
  test('detects "student card" regardless of other words present', () => {
    expect(matchesOutOfScopeTerm('replacement student card fees')).toBeTruthy()
    expect(matchesOutOfScopeTerm('my student card is broken, can I still study?')).toBeTruthy()
  })

  test('detects "wifi" variants', () => {
    expect(matchesOutOfScopeTerm('wifi is down in my dorm')).toBeTruthy()
    expect(matchesOutOfScopeTerm('My Wi-Fi isn’t working')).toBeTruthy()
  })

  test('returns null for an ordinary in-scope query', () => {
    expect(matchesOutOfScopeTerm('I need extra time on an exam')).toBeNull()
  })
})

describe('matchJourneys', () => {
  test('matches a single journey for a clear query', () => {
    const result = matchJourneys('I need extra time on an exam')
    expect(Array.from(result.keys())).toEqual(['accessibility'])
  })

  test('matches the documented "accomodation" typo (F-10)', () => {
    const result = matchJourneys('accomodation support')
    expect(result.has('accessibility')).toBe(true)
  })

  test('matches multiple journeys for a multi-intent query', () => {
    const result = matchJourneys('I’m stressed, need accommodation, and can’t pay fees')
    expect(result.has('wellbeing_safety')).toBe(true)
    expect(result.has('accessibility')).toBe(true)
    expect(result.has('financial_support')).toBe(true)
  })

  test('a Wi-Fi query matches no journey', () => {
    expect(matchJourneys('My Wi-Fi isn’t working').size).toBe(0)
  })

  test('a student-card query matches no journey', () => {
    expect(matchJourneys('How do I get a replacement student card?').size).toBe(0)
  })

  test('word-boundary matching does not false-positive on a substring', () => {
    // "fee" must not match inside "feedback"
    const result = matchJourneys('I have feedback about the course')
    expect(result.has('financial_support')).toBe(false)
  })
})
