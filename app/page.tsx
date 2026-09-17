'use client'

import { useState, FormEvent } from 'react'
import type { ResolutionResult } from '@/lib/resolution/types'

interface CategoryCard {
  key: string
  label: string
}

const CATEGORY_CARDS: CategoryCard[] = [
  { key: 'academic_support', label: 'Academic support' },
  { key: 'financial_support', label: 'Money, fees, and financial aid' },
  { key: 'accessibility', label: 'Accommodations and accessibility' },
  { key: 'wellbeing_safety', label: 'Wellbeing and safety' },
  { key: 'general_student_services', label: 'General student services' },
  { key: 'unsure', label: "I'm not sure where to start" },
]

type Status = 'empty' | 'loading' | 'result' | 'error'

export default function Home() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<ResolutionResult | null>(null)
  const [status, setStatus] = useState<Status>('empty')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function fetchResolution(params: string) {
    setStatus('loading')
    setErrorMessage(null)
    try {
      const response = await fetch(`/api/resolve?${params}`)
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || `Request failed (HTTP ${response.status})`)
      }
      const data: ResolutionResult = await response.json()
      setResult(data)
      setStatus('result')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  function handleCategory(key: string) {
    fetchResolution(`category=${encodeURIComponent(key)}`)
  }

  function handleUrgent() {
    fetchResolution('category=urgent')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    fetchResolution(`q=${encodeURIComponent(query.trim())}`)
  }

  function handleRecovery() {
    fetchResolution('recovery=true')
  }

  function handleOptionClick(journey: string) {
    fetchResolution(`category=${encodeURIComponent(journey)}`)
  }

  return (
    <div>
      <h1>Student Services Navigator</h1>
      <p className="page-subtitle">
        Concept demonstrator &mdash; do not enter personal information.
      </p>

      {/* Persistent urgent-help route: always visible, never requires search
          submission (F-16, A-09). */}
      <button type="button" className="urgent-help-button" onClick={handleUrgent} disabled={status === 'loading'}>
        Need urgent help or feel unsafe?
      </button>

      <section className="category-section" aria-label="Choose your need">
        <h2 className="section-heading">What do you need help with?</h2>
        <div className="category-grid" role="group" aria-label="Categories">
          {CATEGORY_CARDS.map((c) => (
            <button
              key={c.key}
              type="button"
              className="category-card"
              onClick={() => handleCategory(c.key)}
              disabled={status === 'loading'}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <form className="question-section" onSubmit={handleSubmit}>
        <label htmlFor="question">Or describe what you need in your own words (optional)</label>
        <input
          id="question"
          type="text"
          placeholder="e.g. I need extra time on an exam"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="submit-button" disabled={status === 'loading' || !query.trim()}>
          {status === 'loading' ? 'Searching…' : 'Find my service'}
        </button>
      </form>

      <div aria-live="polite">
        {status === 'empty' && (
          <p className="empty-state">
            Choose a category above, or describe your need in your own words, to get started.
          </p>
        )}

        {status === 'loading' && (
          <div className="loading-state" role="status">
            <p>Looking for the right service&hellip;</p>
          </div>
        )}

        {status === 'error' && (
          <div className="error-message" role="alert">
            <p>Something went wrong: {errorMessage}</p>
            <p>
              Please try again, or{' '}
              <a href="https://nbcc.ca/contact-us" target="_blank" rel="noopener noreferrer">
                contact NBCC directly
              </a>
              .
            </p>
          </div>
        )}

        {status === 'result' && result && (
          <ResultCard result={result} onRecovery={handleRecovery} onOptionClick={handleOptionClick} />
        )}
      </div>

      <div className="about-panel">
        <h3>What is this?</h3>
        <p>
          This is a concept demonstrator. It uses a fully deterministic (no AI model) match
          against publicly available NBCC Student Services information to suggest where to
          go next, or connects you with a person when that is the safer or more
          appropriate outcome.
        </p>
        <p>
          For urgent or sensitive questions, use the &ldquo;Need urgent help or feel
          unsafe?&rdquo; button above, or{' '}
          <a href="https://nbcc.ca/contact-us" target="_blank" rel="noopener noreferrer">
            contact NBCC directly
          </a>
          .
        </p>
      </div>
    </div>
  )
}

function ResultCard({
  result,
  onRecovery,
  onOptionClick,
}: {
  result: ResolutionResult
  onRecovery: () => void
  onOptionClick: (journey: string) => void
}) {
  return (
    <div className={`result-card result-card--${result.state}`}>
      {result.state === 'safety_escalation' && result.escalation && (
        <div className="danger-notice" role="alert">
          {result.escalation.message}
        </div>
      )}

      <p className="result-message">{result.message}</p>

      {result.state === 'safety_escalation' && result.escalation && (
        <a className="primary-action-button" href={result.escalation.action.href} target="_blank" rel="noopener noreferrer">
          {result.escalation.action.label}
        </a>
      )}

      {result.state !== 'safety_escalation' && result.primaryAction.href && (
        <a className="primary-action-button" href={result.primaryAction.href} target="_blank" rel="noopener noreferrer">
          {result.primaryAction.label}
        </a>
      )}

      {result.source && (
        <p className="result-source">
          <strong>Official source:</strong>{' '}
          <a href={result.source.url} target="_blank" rel="noopener noreferrer">
            {result.source.title}
          </a>
        </p>
      )}

      {result.state === 'guided_choice' && result.options && (
        <div className="guided-options" role="group" aria-label="Choose the closest match">
          {result.options.map((opt) => (
            <button key={opt.journey} type="button" className="guided-option-button" onClick={() => onOptionClick(opt.journey)}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="recovery-row">
        <button type="button" className="recovery-button" onClick={onRecovery}>
          This is not the right service
        </button>
      </div>

      <p className="result-limits">
        This tool does not make eligibility, funding, accommodation, health, safety, or
        disciplinary decisions on your behalf. It only points you toward approved
        information and, where needed, a named human contact.
      </p>
    </div>
  )
}
