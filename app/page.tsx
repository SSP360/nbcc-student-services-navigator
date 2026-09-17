'use client'

import { useState, FormEvent } from 'react'
import type { NavigateResult } from '@/lib/navigate'
import { JOURNEY_LABELS } from '@/lib/journey-labels'

interface ScenarioButton {
  label: string
  question: string
}

// Wellbeing/safety wording is the proven GQ-04 question
// (evals/golden_questions.json) — verified end-to-end to escalate correctly
// to Wellness and Counselling (NBCC-SS-005).
const SCENARIOS: ScenarioButton[] = [
  { label: 'Academic support', question: 'How can a Student Success Coach help me transition to college life?' },
  { label: 'Wellbeing / safety', question: 'Is there support for sexual violence or assault on campus?' },
  { label: 'General student services', question: 'What programs and services are available to NBCC students overall?' },
  { label: 'Accessibility', question: 'How do I get academic accommodations if I have a disability or learning barrier?' },
  { label: 'Financial support', question: 'How do I apply for a Canada Student Loan or provincial student financial assistance?' },
]

type Status = 'empty' | 'loading' | 'result' | 'error'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<NavigateResult | null>(null)
  const [status, setStatus] = useState<Status>('empty')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function runQuery(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return

    setStatus('loading')
    setErrorMessage(null)

    try {
      const response = await fetch(`/api/navigate?q=${encodeURIComponent(trimmed)}`)
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || `Request failed (HTTP ${response.status})`)
      }
      const data: NavigateResult = await response.json()
      setResult(data)
      setStatus('result')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    runQuery(question)
  }

  function handleScenario(q: string) {
    setQuestion(q)
    runQuery(q)
  }

  return (
    <div>
      <h1>Student Services Navigator</h1>
      <p className="page-subtitle">
        Concept demonstrator &mdash; do not enter personal information.
      </p>

      <form className="question-section" onSubmit={handleSubmit}>
        <label htmlFor="question">What can we help you with today?</label>
        <input
          id="question"
          type="text"
          placeholder="Ask about NBCC services, programs, or support..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="submit" className="submit-button" disabled={status === 'loading' || !question.trim()}>
          {status === 'loading' ? 'Searching…' : 'Find my service'}
        </button>

        <div className="scenario-buttons" role="group" aria-label="Example questions">
          <p className="scenario-label">Or try an example:</p>
          {SCENARIOS.map((s) => (
            <button
              key={s.label}
              type="button"
              className="scenario-button"
              onClick={() => handleScenario(s.question)}
              disabled={status === 'loading'}
            >
              {s.label}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite">
        {status === 'empty' && (
          <p className="empty-state">Ask a question above, or choose an example, to get started.</p>
        )}

        {status === 'loading' && (
          <div className="loading-state" role="status">
            <p>Looking for the right NBCC service&hellip;</p>
          </div>
        )}

        {status === 'error' && (
          <div className="error-message" role="alert">
            <p>Something went wrong: {errorMessage}</p>
            <p>Please try again, or <a href="https://nbcc.ca/contact-us" target="_blank" rel="noopener noreferrer">contact NBCC directly</a>.</p>
          </div>
        )}

        {status === 'result' && result && <ResultCard result={result} />}
      </div>

      <div className="about-panel">
        <h3>What is this?</h3>
        <p>
          This is a concept demonstrator. It uses a fully deterministic (no AI model) search
          over publicly available NBCC Student Services pages to suggest where to go next.
        </p>
        <p>
          For urgent or sensitive questions, please <a href="https://nbcc.ca/contact-us" target="_blank" rel="noopener noreferrer">contact NBCC directly</a>.
        </p>
      </div>
    </div>
  )
}

function ResultCard({ result }: { result: NavigateResult }) {
  return (
    <div className="result-card">
      <h2>{JOURNEY_LABELS[result.journey]}</h2>

      {result.showImmediateDangerNotice && (
        <div className="danger-notice" role="alert">
          If you are in immediate danger, contact local emergency services.
        </div>
      )}

      <p className="result-next-step"><strong>What to do next:</strong> {result.whatToDoNext}</p>
      <p className="result-why"><strong>Why:</strong> {result.why}</p>

      {result.hasSource && result.source && (
        <div className="result-source">
          <strong>Approved source:</strong>{' '}
          <a href={result.source.url} target="_blank" rel="noopener noreferrer">
            {result.source.title}
          </a>{' '}
          <span className="source-id">({result.source.id})</span>
        </div>
      )}

      {!result.hasSource && (
        <p className="no-source-note">
          We do not have an approved NBCC source for this exact question.
        </p>
      )}

      {result.escalation.should_escalate && (
        <div className="escalation-box">
          <p className="escalation-heading">This needs a person, not an automated answer.</p>
          <p>{result.escalation.message}</p>
          {result.escalation.target && (
            <p>
              <strong>Contact:</strong>{' '}
              <a href={result.escalation.target.url} target="_blank" rel="noopener noreferrer">
                {result.escalation.target.title}
              </a>{' '}
              <span className="source-id">({result.escalation.target.id})</span>
            </p>
          )}
        </div>
      )}

      <p className="result-limits">
        This tool does not provide counselling, make eligibility decisions, respond to
        emergencies, or give advice about your individual case. It only points you toward
        approved information and, where needed, a named NBCC contact.
      </p>
    </div>
  )
}
