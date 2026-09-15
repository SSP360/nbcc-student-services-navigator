export interface Source {
  id: string
  title: string
  url: string
  domain: string
  campuses: string[]
  languages: string[]
  source_type: 'webpage' | 'document' | 'pdf' | 'other'
  authority: 'nbcc_public' | 'nbcc_internal'
  retrieved_at: string
  time_sensitive: boolean
  review_status: 'prototype_public_source' | 'approved' | 'deprecated'
}

export interface SourcesYaml {
  sources: Source[]
}

export interface HealthResponse {
  status: 'ok' | 'error'
  service: string
  version: string
  timestamp: string
}

export interface RetrievedSourceContent {
  id: string
  title: string
  url: string
  retrieved_at: string
  retrieval_method: 'live-fetch' | 'snapshot'
  retrieval_status: 'success' | 'error'
  extracted_text?: string
  error?: string
}

export interface SourcesViewResponse {
  sources: Source[]
  count: number
}

export const ALLOWED_DOMAINS = [
  'nbcc.ca',
  'documents.nbcc.ca',
]

export const ALLOWED_AUTHORITIES = ['nbcc_public']
export const ALLOWED_REVIEW_STATUSES = ['prototype_public_source']
