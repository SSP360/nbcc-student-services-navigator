import { decideEscalation } from '@/lib/escalation'

describe('decideEscalation — crisis_or_safety trigger (ESCALATION_POLICY.md trigger 1)', () => {
  test('escalates on a sexual assault / violence query', () => {
    const decision = decideEscalation('Is there support for sexual violence or assault on campus?', 'wellbeing_safety', 3)
    expect(decision.should_escalate).toBe(true)
    expect(decision.trigger).toBe('crisis_or_safety')
    expect(decision.target_service_id).toBe('NBCC-SS-005')
  })

  test('escalates on a crisis keyword', () => {
    const decision = decideEscalation('I am in crisis and need help now', 'wellbeing_safety', 2)
    expect(decision.should_escalate).toBe(true)
    expect(decision.trigger).toBe('crisis_or_safety')
  })

  test('resolves a target service title and URL from the source catalogue', () => {
    const decision = decideEscalation('I need to report harassment', 'wellbeing_safety', 1)
    expect(decision.target_service_title).toBeTruthy()
    expect(decision.target_service_url).toMatch(/^https:\/\//)
  })

  test('crisis trigger takes priority over an unmatched-query condition', () => {
    const decision = decideEscalation('emergency', 'general_contact', 0)
    expect(decision.trigger).toBe('crisis_or_safety')
  })

  test('always targets Wellness and Counselling (NBCC-SS-005), independent of the journey argument', () => {
    // Regression test: a crisis/safety disclosure must not be routed by
    // whichever journey retrieval happened to derive (which can be wrong,
    // e.g. the known D2-FU-01 near-miss). Passing an unrelated journey here
    // must not change the target service.
    const decision = decideEscalation('Is there support for sexual violence or assault on campus?', 'academic_support', 3)
    expect(decision.target_service_id).toBe('NBCC-SS-005')
  })
})

describe('decideEscalation — unmatched_query trigger (ESCALATION_POLICY.md trigger 4)', () => {
  test('escalates when retrieval found zero results', () => {
    const decision = decideEscalation('some completely unrelated question', 'general_contact', 0)
    expect(decision.should_escalate).toBe(true)
    expect(decision.trigger).toBe('unmatched_query')
    expect(decision.target_service_id).toBe('NBCC-SS-007')
  })

  test('does not fire when retrieval found at least one result', () => {
    const decision = decideEscalation('normal informational question', 'academic_support', 1)
    expect(decision.trigger).not.toBe('unmatched_query')
  })
})

describe('decideEscalation — accommodation_request trigger (ESCALATION_POLICY.md trigger 3)', () => {
  test('escalates on an accommodation request', () => {
    const decision = decideEscalation('I need an accommodation for my exam', 'accessibility_inclusion', 2)
    expect(decision.should_escalate).toBe(true)
    expect(decision.trigger).toBe('accommodation_request')
    expect(decision.target_service_id).toBe('NBCC-SS-004')
  })
})

describe('decideEscalation — personalized_decision trigger (ESCALATION_POLICY.md trigger 2)', () => {
  test('escalates on an eligibility question', () => {
    const decision = decideEscalation('Am I eligible for the program?', 'academic_support', 2)
    expect(decision.should_escalate).toBe(true)
    expect(decision.trigger).toBe('personalized_decision')
  })

  test('escalates on a loan approval question', () => {
    const decision = decideEscalation('What are my chances of loan approval?', 'financial_support', 2)
    expect(decision.should_escalate).toBe(true)
    expect(decision.trigger).toBe('personalized_decision')
  })
})

describe('decideEscalation — urgent_timeframe trigger (ESCALATION_POLICY.md trigger 5)', () => {
  test('escalates on an urgent deadline phrase', () => {
    const decision = decideEscalation('My deadline is today and I need urgent help', 'general_contact', 2)
    expect(decision.should_escalate).toBe(true)
    // crisis terms are checked first; "urgent" alone (no crisis term) should trigger urgent_timeframe
  })

  test('plain "urgent" without other triggers maps to urgent_timeframe', () => {
    const decision = decideEscalation('I need this urgent please', 'general_contact', 2)
    expect(decision.should_escalate).toBe(true)
    expect(decision.trigger).toBe('urgent_timeframe')
  })
})

describe('decideEscalation — no trigger (informational answer is appropriate)', () => {
  test('does not escalate a plain informational question with results', () => {
    const decision = decideEscalation('Who do I contact for wellness and counselling support?', 'wellbeing_safety', 3)
    expect(decision.should_escalate).toBe(false)
    expect(decision.trigger).toBe('none')
    expect(decision.target_service_id).toBeNull()
  })

  test('does not escalate on common informational terms already covered by curated content (e.g. "anxious")', () => {
    const decision = decideEscalation("I'm feeling anxious, what resources does NBCC have?", 'wellbeing_safety', 3)
    expect(decision.should_escalate).toBe(false)
  })
})

describe('decideEscalation — priority order', () => {
  test('crisis_or_safety is checked before accommodation_request', () => {
    const decision = decideEscalation('I was assaulted and need an accommodation', 'accessibility_inclusion', 1)
    expect(decision.trigger).toBe('crisis_or_safety')
  })

  test('unmatched_query is checked before accommodation_request/personalized_decision/urgent', () => {
    const decision = decideEscalation('some vague unrelated words with no keyword hits', 'general_contact', 0)
    expect(decision.trigger).toBe('unmatched_query')
  })
})
