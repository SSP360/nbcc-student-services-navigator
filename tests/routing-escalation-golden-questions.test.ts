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
  escalation_note?: string
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

describe('Golden Questions — Routing and Escalation Evaluation (Day 3)', () => {
  const golden = loadGoldenQuestions()
  const corpus = loadAllCuratedSources()

  test('every golden question defines expected_journey and expected_escalation', () => {
    golden.questions.forEach((q) => {
      expect(q.expected_journey).toBeTruthy()
      expect(typeof q.expected_escalation).toBe('boolean')
    })
  })

  describe('per-question journey routing', () => {
    golden.questions.forEach((q) => {
      test(`${q.id}: "${q.question}" routes to journey "${q.expected_journey}"`, () => {
        const results = searchCuratedSources(q.question, corpus)
        const routing = routeQuery(q.question, results)
        expect(routing.journey).toBe(q.expected_journey)
      })
    })
  })

  describe('per-question escalation decisions', () => {
    golden.questions.forEach((q) => {
      test(`${q.id}: "${q.question}" escalation decision is ${q.expected_escalation}`, () => {
        const results = searchCuratedSources(q.question, corpus)
        const routing = routeQuery(q.question, results)
        const escalation = decideEscalation(q.question, routing.journey, results.length)
        expect(escalation.should_escalate).toBe(q.expected_escalation)
      })
    })
  })

  test('all 10 golden questions route to the expected journey (repeatable evaluation)', () => {
    let passCount = 0
    const details: { id: string; expected: string; actual: string }[] = []

    for (const q of golden.questions) {
      const results = searchCuratedSources(q.question, corpus)
      const routing = routeQuery(q.question, results)
      const passed = routing.journey === q.expected_journey
      if (passed) passCount++
      details.push({ id: q.id, expected: q.expected_journey, actual: routing.journey })
    }

    if (passCount < golden.questions.length) {
      console.error('Routing mismatches:', JSON.stringify(details.filter((d) => d.expected !== d.actual), null, 2))
    }

    expect(passCount).toBe(golden.questions.length)
  })

  test('all 10 golden questions produce the expected escalation decision (repeatable evaluation)', () => {
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
      console.error('Escalation mismatches:', JSON.stringify(details.filter((d) => d.expected !== d.actual), null, 2))
    }

    expect(passCount).toBe(golden.questions.length)
  })

  test('GQ-04 escalates via crisis_or_safety independent of its retrieval ranking (D2-FU-01 safety backstop)', () => {
    const gq04 = golden.questions.find((q) => q.id === 'GQ-04')!
    const results = searchCuratedSources(gq04.question, corpus)
    const routing = routeQuery(gq04.question, results)
    const escalation = decideEscalation(gq04.question, routing.journey, results.length)

    expect(escalation.should_escalate).toBe(true)
    expect(escalation.trigger).toBe('crisis_or_safety')
    // This assertion documents that escalation for this question does not
    // depend on which source ranked #1 in retrieval (the known D2-FU-01
    // near-miss), since the crisis keyword check runs independent of score.
  })
})
