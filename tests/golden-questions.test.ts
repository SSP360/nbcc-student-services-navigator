import fs from 'fs'
import path from 'path'
import { searchCuratedSources } from '@/lib/retrieval'
import { loadAllCuratedSources } from '@/lib/curated-sources'

interface GoldenQuestion {
  id: string
  question: string
  expected_source_ids: string[]
  grounding: string
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

describe('Golden Questions — Repeatable Retrieval Evaluation', () => {
  const golden = loadGoldenQuestions()
  const corpus = loadAllCuratedSources()

  test('exactly 12 golden questions are defined (P0: GQ-11/GQ-12 added)', () => {
    expect(golden.questions.length).toBe(12)
  })

  test('every golden question references a source that exists in the curated corpus', () => {
    const curatedIds = new Set(corpus.map((c) => c.source_id))
    golden.questions.forEach((q) => {
      q.expected_source_ids.forEach((id) => {
        expect(curatedIds.has(id)).toBe(true)
      })
    })
  })

  describe('per-question retrieval results (top 3)', () => {
    golden.questions.forEach((q) => {
      test(`${q.id}: "${q.question}" surfaces an expected source in top 3`, () => {
        const results = searchCuratedSources(q.question, corpus)
        const top3Ids = results.slice(0, 3).map((r) => r.source_id)
        const matched = q.expected_source_ids.some((id) => top3Ids.includes(id))
        expect(matched).toBe(true)
      })
    })
  })

  test('at least 10 of 12 golden questions return an expected source in the top 3 (Day 2 success measure, scaled)', () => {
    let passCount = 0
    const details: { id: string; question: string; passed: boolean; top3: string[] }[] = []

    for (const q of golden.questions) {
      const results = searchCuratedSources(q.question, corpus)
      const top3Ids = results.slice(0, 3).map((r) => r.source_id)
      const passed = q.expected_source_ids.some((id) => top3Ids.includes(id))
      if (passed) passCount++
      details.push({ id: q.id, question: q.question, passed, top3: top3Ids })
    }

    if (passCount < 10) {
      console.error('Golden question failures:', JSON.stringify(details.filter((d) => !d.passed), null, 2))
    }

    expect(passCount).toBeGreaterThanOrEqual(10)
  })

  test('every result for every golden question explains its keyword match', () => {
    golden.questions.forEach((q) => {
      const results = searchCuratedSources(q.question, corpus)
      results.forEach((r) => {
        expect(r.matched_terms.length).toBeGreaterThan(0)
      })
    })
  })
})
