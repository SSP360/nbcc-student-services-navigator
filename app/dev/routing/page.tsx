'use client'

import { useState } from 'react'
import { RoutingApiResponse } from '@/app/api/dev/routing/route'

export default function DevRoutingPage() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<RoutingApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notDev, setNotDev] = useState(false)
  const [loading, setLoading] = useState(false)

  async function runQuery(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dev/routing?q=${encodeURIComponent(query)}`)
      if (res.status === 404) {
        setNotDev(true)
        return
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data: RoutingApiResponse = await res.json()
      setResponse(data)
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  if (notDev) {
    return (
      <div className="container">
        <h1>Not Available</h1>
        <div className="error-message">This view is not available in production.</div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Routing Inspector (Day 3)</h1>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>
        Shows the full deterministic pipeline for a query: keyword retrieval → journey
        routing → policy-driven escalation decision. No language model is used at any
        step — every decision below is a fixed rule or lookup and is fully explainable.
      </p>

      <form onSubmit={runQuery} className="question-section" style={{ marginBottom: '2rem' }}>
        <label htmlFor="query">Try a student-style question</label>
        <input
          id="query"
          type="text"
          placeholder="e.g. Is there support for sexual violence or assault on campus?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', cursor: 'pointer' }}
        >
          {loading ? 'Processing…' : 'Run'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {response && (
        <div>
          {/* Step 1: Retrieval */}
          <div className="source-display" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginTop: 0 }}>1. Retrieval</h2>
            <p style={{ color: '#666' }}>{response.retrieval.result_count} curated source(s) matched.</p>
            {response.retrieval.results.map((r, idx) => (
              <div key={r.source_id} className="source-metadata" style={{ marginBottom: '0.5rem' }}>
                <p>
                  <strong>#{idx + 1} {r.source_id}</strong> ({r.title}) — domain: {r.domain}, score: {r.score}
                </p>
              </div>
            ))}
          </div>

          {/* Step 2: Journey routing */}
          <div className="source-display" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginTop: 0 }}>2. Journey Routing</h2>
            <div className="source-metadata">
              <p><strong>Journey:</strong> <code>{response.routing.journey}</code></p>
              <p><strong>Reason:</strong> {response.routing.reason}</p>
            </div>
          </div>

          {/* Step 3: Escalation */}
          <div
            className="source-display"
            style={{
              marginBottom: '1.5rem',
              borderLeft: response.escalation.should_escalate ? '4px solid #dc3545' : '4px solid #28a745',
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              3. Escalation Decision — {response.escalation.should_escalate ? '🔴 ESCALATE' : '🟢 No escalation'}
            </h2>
            <div className="source-metadata">
              <p><strong>Trigger:</strong> <code>{response.escalation.trigger}</code></p>
              {response.escalation.matched_term && (
                <p><strong>Matched term:</strong> "{response.escalation.matched_term}"</p>
              )}
              <p><strong>Reason:</strong> {response.escalation.reason}</p>
              {response.escalation.should_escalate && (
                <>
                  <p><strong>Target service:</strong> {response.escalation.target_service_id} — {response.escalation.target_service_title}</p>
                  {response.escalation.target_service_url && (
                    <p>
                      <strong>Contact URL:</strong>{' '}
                      <a href={response.escalation.target_service_url} target="_blank" rel="noopener noreferrer">
                        {response.escalation.target_service_url}
                      </a>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
