'use client'

import { useState } from 'react'
import { RetrievalResult } from '@/lib/retrieval'

interface ApiResponse {
  query: string
  result_count: number
  results: RetrievalResult[]
}

export default function DevRetrievalPage() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notDev, setNotDev] = useState(false)
  const [loading, setLoading] = useState(false)

  async function runSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dev/retrieval?q=${encodeURIComponent(query)}`)
      if (res.status === 404) {
        setNotDev(true)
        return
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data: ApiResponse = await res.json()
      setResponse(data)
    } catch (err) {
      setError(`Search failed: ${err instanceof Error ? err.message : String(err)}`)
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
      <h1>Retrieval Inspector (Day 2)</h1>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>
        Deterministic keyword search over the curated content corpus. No language model,
        embeddings, or vector database is used — every result below is scored purely from
        exact keyword overlap and shows exactly which terms matched and where.
      </p>

      <form onSubmit={runSearch} className="question-section" style={{ marginBottom: '2rem' }}>
        <label htmlFor="query">Try a student-style question</label>
        <input
          id="query"
          type="text"
          placeholder="e.g. Who do I contact for wellness and counselling support?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', cursor: 'pointer' }}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {response && (
        <div>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Query: <code>{response.query}</code> — {response.result_count} result(s)
          </p>

          {response.results.length === 0 ? (
            <div className="error-message">No curated source matched any term in this query.</div>
          ) : (
            response.results.map((r, idx) => (
              <div key={r.source_id} className="source-display" style={{ marginBottom: '1.5rem' }}>
                <div className="source-metadata">
                  <p>
                    <strong>Rank {idx + 1}</strong> — Score: <strong>{r.score}</strong>
                  </p>
                  <p><strong>Source ID:</strong> {r.source_id}</p>
                  <p><strong>Title:</strong> {r.title}</p>
                  <p><strong>Domain:</strong> {r.domain}</p>
                  <p>
                    <strong>URL:</strong>{' '}
                    <a href={r.url} target="_blank" rel="noopener noreferrer">{r.url}</a>
                  </p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Why this matched:</p>
                  <ul style={{ marginLeft: '1.2rem' }}>
                    {r.matched_terms.map((m) => (
                      <li key={m.term}>
                        <code>{m.term}</code>
                        {m.inTitle && ' — in title'}
                        {m.inDomain && ' — in domain'}
                        {m.bodyOccurrences > 0 && ` — ${m.bodyOccurrences}x in content`}
                      </li>
                    ))}
                  </ul>
                  {r.snippet && (
                    <p style={{ marginTop: '0.75rem', fontStyle: 'italic', color: '#444' }}>
                      "…{r.snippet}…"
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
