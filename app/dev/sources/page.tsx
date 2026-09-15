'use client'

import { useEffect, useState } from 'react'
import { Source } from '@/lib/types'

export default function DevSourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    async function loadSources() {
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
    loadSources()
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
