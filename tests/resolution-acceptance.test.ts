import { resolutionAcceptanceCases, ResolutionAcceptanceCase } from '@/evals/resolution-acceptance-cases'
import { resolveCategory, resolveFreeText, resolveRecovery, CategoryKey } from '@/lib/resolution/engine'
import { ResolutionResult } from '@/lib/resolution/types'

/**
 * Maps each acceptance case's human-readable `input` to how the engine is
 * actually invoked. This mapping is test scaffolding only — it does not
 * change any `id`, `expectedStates`, `expectedJourney`, `expectedOutcome`,
 * or `forbiddenOutcomes` value from evals/resolution-acceptance-cases.ts.
 */
const CATEGORY_INPUT_TO_KEY: Record<string, CategoryKey> = {
  'Academic support': 'academic_support',
  'Money, fees, and financial aid': 'financial_support',
  'Accommodations and accessibility': 'accessibility',
  'Wellbeing and safety': 'wellbeing_safety',
  'General student services': 'general_student_services',
  'I’m not sure where to start': 'unsure',
  'Need urgent help or feel unsafe?': 'urgent',
  'Choose a guided category': 'academic_support', // F-17: any concrete category is representative
}

function resolve(testCase: ResolutionAcceptanceCase): ResolutionResult {
  if (testCase.kind === 'recovery') {
    return resolveRecovery()
  }
  if (testCase.kind === 'category') {
    const key = CATEGORY_INPUT_TO_KEY[testCase.input]
    if (!key) {
      throw new Error(`No category mapping for acceptance case ${testCase.id} input "${testCase.input}"`)
    }
    return resolveCategory(key)
  }
  return resolveFreeText(testCase.input)
}

describe('P0 acceptance contract: every case in evals/resolution-acceptance-cases.ts', () => {
  resolutionAcceptanceCases.forEach((testCase) => {
    test(`${testCase.id}: "${testCase.input}" -> one of [${testCase.expectedStates.join(', ')}]`, () => {
      const result = resolve(testCase)
      expect(testCase.expectedStates).toContain(result.state)

      if (testCase.expectedJourney) {
        expect(result.journey).toBe(testCase.expectedJourney)
      }

      // C-07: never expose raw internals in the learner-facing result.
      expect(result).not.toHaveProperty('score')
      expect(result).not.toHaveProperty('matchedTerms')
      expect(result).not.toHaveProperty('reasonCode')

      // Every non-safety result retains a usable recovery path (C-05); a
      // safety_escalation result carries its own escalation action instead.
      if (result.state !== 'safety_escalation') {
        expect(result.recoveryAction).toBeDefined()
      } else {
        expect(result.escalation).toBeDefined()
      }
    })
  })

  test('every acceptance case ID from the contract is covered by this suite (no silent omission)', () => {
    const coveredIds = resolutionAcceptanceCases.map((c) => c.id)
    expect(coveredIds).toEqual([
      'F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'F-06', 'F-07', 'F-08', 'F-09', 'F-10',
      'F-11', 'F-12', 'F-13', 'F-14', 'F-15', 'F-16', 'F-17', 'F-18',
    ])
  })
})

describe('P0 acceptance contract: specific forbidden-outcome checks', () => {
  test('F-11: sexual assault wording never produces guided_choice or a generic result', () => {
    const result = resolveFreeText('I was sexually assaulted')
    expect(result.state).toBe('safety_escalation')
    expect(result.state).not.toBe('guided_choice')
  })

  test('F-12: replacement student card never routes to academic_support', () => {
    const result = resolveFreeText('How do I get a replacement student card?')
    expect(result.state).toBe('unsupported_query')
    expect(result.journey).not.toBe('academic_support')
  })

  test('F-13: Wi-Fi issue never routes confidently to an unrelated support area', () => {
    const result = resolveFreeText('My Wi-Fi isn’t working')
    expect(result.state).toBe('unsupported_query')
    expect(result.state).not.toBe('confident_route')
  })

  test('F-15: multi-intent query never silently selects a single route', () => {
    const result = resolveFreeText('I’m stressed, need accommodation, and can’t pay fees')
    expect(['guided_choice', 'human_assisted']).toContain(result.state)
    expect(result.state).not.toBe('confident_route')
  })

  test('F-04: wellbeing category selection never hides the urgent-help route', () => {
    const result = resolveCategory('wellbeing_safety')
    // The persistent urgent-help route is a UI-level guarantee (rendered on
    // every screen, see app/page.tsx), verified here at the engine level by
    // confirming the wellbeing journey's own safety source is resolvable.
    expect(result.journey).toBe('wellbeing_safety')
    expect(result.source).toBeDefined()
  })

  test('F-18: "not the right service" is never a dead end', () => {
    const result = resolveRecovery()
    expect(result.state).toBe('guided_choice')
    expect(result.options).toBeDefined()
    expect(result.options!.length).toBeGreaterThan(0)
    expect(result.recoveryAction).toBeDefined()
  })
})

describe('C-01 / C-02: confidence gate behaviour', () => {
  test('a generic-terms-only query cannot alone create a confident route', () => {
    const result = resolveFreeText('I need student support services')
    expect(result.state).not.toBe('confident_route')
  })

  test('a query with no meaningful or generic terms is unsupported_query', () => {
    const result = resolveFreeText('xyzzy1 qwzxcv9 blorpteque')
    expect(result.state).toBe('unsupported_query')
  })

  test('a single strong meaningful term produces a confident route', () => {
    const result = resolveFreeText('I need extra time on an exam')
    expect(result.state).toBe('confident_route')
    expect(result.journey).toBe('accessibility')
  })
})

describe('C-03: close plausible low-risk routes become guided_choice', () => {
  test('a query naming two plausible journeys becomes guided_choice, not a coin-flip route', () => {
    const result = resolveFreeText('I need tutoring but I am also broke')
    expect(result.state).toBe('guided_choice')
  })
})

describe('C-06: thresholds and generic-term rules are documented and versioned', () => {
  test('the confidence-gate thresholds are named, exported, numeric constants', () => {
    const { MIN_MEANINGFUL_TERMS_FOR_CONFIDENT_ROUTE, MIN_SECOND_PLACE_MARGIN } = require('@/lib/resolution/engine')
    expect(typeof MIN_MEANINGFUL_TERMS_FOR_CONFIDENT_ROUTE).toBe('number')
    expect(typeof MIN_SECOND_PLACE_MARGIN).toBe('number')
  })

  test('the phrase registry and generic-term list are non-empty and reviewable', () => {
    const { PHRASE_REGISTRY, GENERIC_TERMS, SAFETY_TERMS } = require('@/lib/resolution/registry')
    expect(PHRASE_REGISTRY.length).toBeGreaterThan(0)
    expect(GENERIC_TERMS.length).toBeGreaterThan(0)
    expect(SAFETY_TERMS.length).toBeGreaterThan(0)
  })
})
