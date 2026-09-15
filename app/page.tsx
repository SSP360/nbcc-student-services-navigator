'use client'

import { useEffect, useState } from 'react'
import { RetrievedSourceContent } from '@/lib/types'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [sourceContent, setSourceContent] = useState<RetrievedSourceContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSourceContent() {
      try {
        const response = await fetch('/api/source/NBCC-SS-001')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data: RetrievedSourceContent = await response.json()
        setSourceContent(data)
      } catch (err) {
        setError(`Failed to load source: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }
    loadSourceContent()
  }, [])

  return (
    <div>
      <h1>NBCC Student Services Navigator</h1>

      <div className="question-section">
        <label htmlFor="question">What can we help you with today?</label>
        <input
          id="question"
          type="text"
          placeholder="Ask about NBCC services, programs, or support..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={false}
        />
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
          💡 <em>On Day 1, your question is not processed. Day 2+ will add AI-powered answers.</em>
        </p>
      </div>

      {loading ? (
        <div className="source-display">
          <p>Loading NBCC services information...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          {error}
        </div>
      ) : sourceContent ? (
        <div className="source-display">
          <h2>NBCC Student Services</h2>
          <div className="source-metadata">
            <p><strong>Source ID:</strong> {sourceContent.id}</p>
            <p><strong>Title:</strong> {sourceContent.title}</p>
            <p><strong>URL:</strong> <a href={sourceContent.url} target="_blank" rel="noopener noreferrer">{sourceContent.url}</a></p>
            <p><strong>Retrieved:</strong> {new Date(sourceContent.retrieved_at).toLocaleString()}</p>
            <p><strong>Retrieval Method:</strong> <code>{sourceContent.retrieval_method}</code></p>
            <p><strong>Retrieval Status:</strong> {sourceContent.retrieval_status === 'success' ? '✓ Success' : '✗ Error'}</p>
            {sourceContent.error && (
              <p><strong>Error Details:</strong> {sourceContent.error}</p>
            )}
          </div>
          {sourceContent.extracted_text ? (
            <div className="source-content">
              {sourceContent.extracted_text.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="error-message">
              No text content could be extracted from this source.
            </div>
          )}
        </div>
      ) : null}

      <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>What is this?</h3>
        <p>
          This is a concept demonstrator. It retrieves publicly available information from NBCC student services pages
          and displays it here. On Day 2+, this will include AI-powered search to help you find the right service faster.
        </p>
        <p>
          For urgent or sensitive questions, please <a href="https://nbcc.ca/contact-us" target="_blank" rel="noopener noreferrer">contact NBCC directly</a>.
        </p>
      </div>
    </div>
  )
}
