import fs from 'fs'
import path from 'path'
import { searchCuratedSources } from '@/lib/retrieval'
import { routeQuery, Journey } from '@/lib/routing'
import { decideEscalation } from '@/lib/escalation'
import { loadAllCuratedSources } from '@/lib/curated-sources'

interface GoldenQuestion {
  id: string
  question: string
  expected_source_ids: string[]
  grounding: string
  expected_journey: Journey
  expected_escalation: boolean
  expected_escalation_target_id?: string
  known_defect_note?: string
}

interface GoldenQuestionsFile {
  description: string
  corpus_size: number
  questions: GoldenQuestion[]
}

function loadGoldenQuestions(): GoldenQuestionsFile {
  const filePath = path.join(process.cwd(), 'evals', 'golden_questions.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as GoldenQuestionsFile
}

/**
 * These metrics are evaluated separately and are NOT interchangeable:
 *
 * - Journey classification accuracy: did routeQuery() pick the correct
 *   journey label?
 * - Escalation-trigger accuracy: did decideEscalation() correctly decide
 *   whether to escalate at all?
 * - Escalation-target accuracy: for questions that DO escalate, did it
 *   route to the correct human contact?
 *
 * GQ-04 has a known, currently-failing journey classification (see
 * evals/golden_questions.json "known_defect_note" and
 * product/BACKLOG.md D2-FU-01). expected_journey is intentionally set to
 * the PRODUCT-INTENDED value (wellbeing_safety), not the system's current
 * output, so this defect stays visible rather than being silently
 * absorbed into the test. The per-question test below for GQ-04's journey
 * is EXPECTED TO FAIL until D2-FU-01 is fixed. This is deliberate,
 * documented evidence — not skipped, inverted, or bypassed.
 */

describe('Golden Questions — Routing and Escalation Evaluation (Day 3)', () => {
  const golden = loadGoldenQuestions()
  const corpus = loadAllCuratedSources()

  test('every golden question defines expected_journey and expected_escalation', () => {
    golden.questions.forEach((q) => {
      expect(q.expected_journey).toBeTruthy()
      expect(typeof q.expected_escalation).toBe('boolean')
    })
  })

  describe('per-question journey routing (KNOWN: GQ-04 currently fails — see note above)', () => {
    golden.questions.forEach((q) => {
      test(`${q.id}: "${q.question}" routes to journey "${q.expected_journey}"`, () => {
        const results = searchCuratedSources(q.question, corpus)
        const routing = routeQuery(q.question, results)
        expect(routing.journey).toBe(q.expected_journey)
      })
    })
  })

  describe('per-question escalation-trigger decisions', () => {
    golden.questions.forEach((q) => {
      test(`${q.id}: "${q.question}" escalation decision is ${q.expected_escalation}`, () => {
        const results = searchCuratedSources(q.question, corpus)
        const routing = routeQuery(q.question, results)
        const escalation = decideEscalation(q.question, routing.journey, results.length)
        expect(escalation.should_escalate).toBe(q.expected_escalation)
      })
    })
  })

  describe('per-question escalation-target accuracy (only questions expected to escalate)', () => {
    const escalatingQuestions = golden.questions.filter((q) => q.expected_escalation && q.expected_escalation_target_id)

    test('at least one golden question exercises escalation-target routing', () => {
      expect(escalatingQuestions.length).toBeGreaterThan(0)
    })

    escalatingQuestions.forEach((q) => {
      test(`${q.id}: escalation targets ${q.expected_escalation_target_id}`, () => {
        const results = searchCuratedSources(q.question, corpus)
        const routing = routeQuery(q.question, results)
        const escalation = decideEscalation(q.question, routing.journey, results.length)
        expect(escalation.target_service_id).toBe(q.expected_escalation_target_id)
      })
    })
  })

  test('METRIC — journey classification accuracy: 10 of 10 (D2-FU-01 fixed; GQ-04 no longer a known-failing case)', () => {
    let passCount = 0
    const details: { id: string; expected: string; actual: string }[] = []

    for (const q of golden.questions) {
      const results = searchCuratedSources(q.question, corpus)
      const routing = routeQuery(q.question, results)
      const passed = routing.journey === q.expected_journey
      if (passed) passCount++
      details.push({ id: q.id, expected: q.expected_journey, actual: routing.journey })
    }

    const mismatches = details.filter((d) => d.expected !== d.actual)
    if (mismatches.length > 0) {
      // eslint-disable-next-line no-console
      console.error('Journey classification mismatches:', JSON.stringify(mismatches, null, 2))
    }

    // This asserts the actual, honest current count. If this regresses
    // below 10, that is a real defect to investigate — never edit this
    // assertion merely to keep the suite green.
    expect(passCount).toBe(10)
    expect(mismatches).toEqual([])
  })

  test('METRIC — escalation-trigger accuracy: 10 of 10', () => {
    let passCount = 0
    const details: { id: string; expected: boolean; actual: boolean; trigger: string }[] = []

    for (const q of golden.questions) {
      const results = searchCuratedSources(q.question, corpus)
      const routing = routeQuery(q.question, results)
      const escalation = decideEscalation(q.question, routing.journey, results.length)
      const passed = escalation.should_escalate === q.expected_escalation
      if (passed) passCount++
      details.push({ id: q.id, expected: q.expected_escalation, actual: escalation.should_escalate, trigger: escalation.trigger })
    }

    if (passCount < golden.questions.length) {
      // eslint-disable-next-line no-console
      console.error('Escalation-trigger mismatches:', JSON.stringify(details.filter((d) => d.expected !== d.actual), null, 2))
    }

    expect(passCount).toBe(golden.questions.length)
  })

  test('METRIC — escalation-target accuracy: 1 of 1 (only GQ-04 among the 10 golden questions is expected to escalate)', () => {
    const escalatingQuestions = golden.questions.filter((q) => q.expected_escalation && q.expected_escalation_target_id)
    let passCount = 0

    for (const q of escalatingQuestions) {
      const results = searchCuratedSources(q.question, corpus)
      const routing = routeQuery(q.question, results)
      const escalation = decideEscalation(q.question, routing.journey, results.length)
      if (escalation.target_service_id === q.expected_escalation_target_id) passCount++
    }

    expect(passCount).toBe(escalatingQuestions.length)
  })

  test('GQ-04 journey and escalation target are both correct (D2-FU-01 fixed)', () => {
    const gq04 = golden.questions.find((q) => q.id === 'GQ-04')!
    const results = searchCuratedSources(gq04.question, corpus)
    const routing = routeQuery(gq04.question, results)
    const escalation = decideEscalation(gq04.question, routing.journey, results.length)

    // Journey classification is now correct following the Day 4 /
    // D2-FU-01 document-frequency exclusive-term fix in lib/retrieval.ts.
    expect(routing.journey).toBe('wellbeing_safety')
    // Escalation-trigger and escalation-target were already correct even
    // before the fix (independent of the journey/retrieval-ranking
    // defect); this continues to hold and is asserted here as a
    // regression guard.
    expect(escalation.should_escalate).toBe(true)
    expect(escalation.trigger).toBe('crisis_or_safety')
    expect(escalation.target_service_id).toBe('NBCC-SS-005')
  })
})
