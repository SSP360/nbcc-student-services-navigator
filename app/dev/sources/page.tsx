'use client'

import { useEffect, useState } from 'react'
import { Source, RetrievedSourceContent } from '@/lib/types'

export default function DevSourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [nbccSS001Content, setNbccSS001Content] = useState<RetrievedSourceContent | null>(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/dev/sources')
        if (response.status === 404) {
          setError('Developer view is only available in development mode.')
          setIsDev(false)
          return
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        setSources(data.sources)
        setIsDev(true)
      } catch (err) {
        setError(`Failed to load sources: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    async function loadNbccContent() {
      try {
        const response = await fetch('/api/source/NBCC-SS-001')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data: RetrievedSourceContent = await response.json()
        setNbccSS001Content(data)
      } catch (err) {
        console.error('Failed to load NBCC-SS-001 content:', err)
      } finally {
        setContentLoading(false)
      }
    }

    loadData()
    loadNbccContent()
  }, [])

  if (error) {
    return (
      <div className="container">
        <h1>Developer Source Inspector</h1>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  if (!isDev) {
    return (
      <div className="container">
        <h1>Not Available</h1>
        <div className="error-message">This view is not available in production.</div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Developer Source Inspector</h1>

      {/* Day 1 Evidence Retrieval Test */}
      <div style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#e8f4f8', borderRadius: '8px', borderLeft: '4px solid #0056b3' }}>
        <h2 style={{ marginTop: 0, color: '#0056b3' }}>Day 1 Evidence Retrieval Test — NBCC-SS-001</h2>
        
        {contentLoading ? (
          <p>Loading NBCC-SS-001 content...</p>
        ) : nbccSS001Content ? (
          <div>
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
              <p><strong>Source ID:</strong> {nbccSS001Content.id}</p>
              <p><strong>Title:</strong> {nbccSS001Content.title}</p>
              <p><strong>URL:</strong> <a href={nbccSS001Content.url} target="_blank" rel="noopener noreferrer">{nbccSS001Content.url}</a></p>
              <p><strong>Retrieval Method:</strong> <code>{nbccSS001Content.retrieval_method}</code></p>
              <p><strong>Retrieval Status:</strong> {nbccSS001Content.retrieval_status === 'success' ? '✓ Success' : '✗ Error'}</p>
              <p><strong>Retrieved At:</strong> {new Date(nbccSS001Content.retrieved_at).toLocaleString()} (UTC)</p>
              {nbccSS001Content.http_status !== undefined && (
                <p><strong>HTTP Status:</strong> {nbccSS001Content.http_status}</p>
              )}
              {nbccSS001Content.content_length !== undefined && (
                <p><strong>Content Length:</strong> {nbccSS001Content.content_length.toLocaleString()} bytes</p>
              )}
              {nbccSS001Content.extracted_text_length !== undefined && (
                <p><strong>Extracted Text Length:</strong> {nbccSS001Content.extracted_text_length.toLocaleString()} characters</p>
              )}
            </div>

            {nbccSS001Content.retrieval_status === 'success' && nbccSS001Content.extracted_text ? (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
                <h3 style={{ marginTop: 0 }}>Extracted Readable Text (First 1,000 characters)</h3>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {nbccSS001Content.extracted_text.substring(0, 1000)}
                  {nbccSS001Content.extracted_text_length && nbccSS001Content.extracted_text_length > 1000 ? '\n\n[... truncated ...]' : ''}
                </pre>
              </div>
            ) : nbccSS001Content.error ? (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', borderLeft: '4px solid #ffc107' }}>
                <strong>Retrieval Error:</strong> {nbccSS001Content.error}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="error-message">Failed to load NBCC-SS-001 content</div>
        )}
      </div>

      {/* Static Catalogue */}
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Showing all {sources.length} sources from the catalogue.
      </p>

      {sources.map((source) => (
        <div key={source.id} className="source-display" style={{ marginBottom: '2rem' }}>
          <div className="source-metadata">
            <p><strong>ID:</strong> {source.id}</p>
            <p><strong>Title:</strong> {source.title}</p>
            <p><strong>URL:</strong> <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}</a></p>
            <p><strong>Domain:</strong> {source.domain}</p>
            <p><strong>Authority:</strong> {source.authority}</p>
            <p><strong>Review Status:</strong> {source.review_status}</p>
            <p><strong>Source Type:</strong> {source.source_type}</p>
            <p><strong>Campuses:</strong> {source.campuses.join(', ')}</p>
            <p><strong>Languages:</strong> {source.languages.join(', ')}</p>
            <p><strong>Time Sensitive:</strong> {source.time_sensitive ? 'Yes' : 'No'}</p>
            <p><strong>Retrieved At:</strong> {source.retrieved_at}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
