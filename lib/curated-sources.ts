import fs from 'fs'
import path from 'path'
import { ALLOWED_DOMAINS, ALLOWED_AUTHORITIES, ALLOWED_REVIEW_STATUSES } from './types'

export const MIN_CONTENT_LENGTH = 500

export interface CuratedSource {
  source_id: string
  title: string
  url: string
  domain: string
  campuses: string[]
  language: string
  source_type: string
  authority: string
  review_status: string
  retrieval_timestamp: string
  retrieval_method: 'live-fetch' | 'snapshot'
  http_status: number | null
  content_length: number
  extracted_text: string
  retrieval_error: string | null
}

export interface CuratedValidationIssue {
  source_id: string
  issue: string
}

const CURATED_DIR = path.join(process.cwd(), 'knowledge', 'curated')

let cachedCuratedSources: CuratedSource[] | null = null

export function loadCuratedSourceIds(): string[] {
  if (!fs.existsSync(CURATED_DIR)) {
    return []
  }
  return fs
    .readdirSync(CURATED_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
}

export function loadCuratedSource(sourceId: string): CuratedSource {
  const filePath = path.join(CURATED_DIR, `${sourceId}.json`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as CuratedSource
}

export function loadAllCuratedSources(): CuratedSource[] {
  if (cachedCuratedSources) {
    return cachedCuratedSources
  }

  const ids = loadCuratedSourceIds()
  const sources = ids.map((id) => loadCuratedSource(id))
  cachedCuratedSources = sources
  return sources
}

/**
 * Validates a single curated source record. Returns a list of human-readable
 * issue strings; an empty array means the record is valid.
 */
export function validateCuratedSource(record: unknown): string[] {
  const issues: string[] = []

  if (!record || typeof record !== 'object') {
    return ['Record is not an object']
  }

  const r = record as Partial<CuratedSource>

  if (!r.source_id || typeof r.source_id !== 'string') {
    issues.push('Missing or invalid source_id')
  }
  if (!r.title || typeof r.title !== 'string') {
    issues.push('Missing or invalid title')
  }
  if (!r.url || typeof r.url !== 'string') {
    issues.push('Missing or invalid url')
  } else {
    try {
      const urlObj = new URL(r.url)
      if (urlObj.protocol !== 'https:') {
        issues.push(`URL is not HTTPS: ${r.url}`)
      }
      if (!ALLOWED_DOMAINS.includes(urlObj.hostname)) {
        issues.push(`URL domain not in approved allowlist: ${urlObj.hostname}`)
      }
    } catch {
      issues.push(`Invalid URL: ${r.url}`)
    }
  }
  if (!r.domain || typeof r.domain !== 'string') {
    issues.push('Missing or invalid domain')
  }
  if (!Array.isArray(r.campuses) || r.campuses.length === 0) {
    issues.push('Missing or invalid campuses')
  }
  if (!r.language || typeof r.language !== 'string') {
    issues.push('Missing or invalid language')
  }
  if (!r.authority || typeof r.authority !== 'string' || !ALLOWED_AUTHORITIES.includes(r.authority)) {
    issues.push('Missing or invalid authority')
  }
  if (!r.review_status || typeof r.review_status !== 'string' || !ALLOWED_REVIEW_STATUSES.includes(r.review_status)) {
    issues.push('Missing or invalid review_status')
  }
  if (!r.retrieval_timestamp || typeof r.retrieval_timestamp !== 'string') {
    issues.push('Missing or invalid retrieval_timestamp')
  } else {
    const parsed = new Date(r.retrieval_timestamp)
    if (isNaN(parsed.getTime())) {
      issues.push(`retrieval_timestamp is not valid ISO-8601: ${r.retrieval_timestamp}`)
    }
  }
  if (r.retrieval_method !== 'live-fetch' && r.retrieval_method !== 'snapshot') {
    issues.push('retrieval_method must be "live-fetch" or "snapshot"')
  }
  if (!r.extracted_text || typeof r.extracted_text !== 'string' || r.extracted_text.trim().length === 0) {
    issues.push('extracted_text is empty')
  } else if (r.extracted_text.length < MIN_CONTENT_LENGTH) {
    issues.push(
      `extracted_text is below minimum usable length (${r.extracted_text.length} < ${MIN_CONTENT_LENGTH})`
    )
  }

  return issues
}

/**
 * Validates the full curated corpus: per-record issues plus cross-record
 * checks such as duplicate IDs.
 */
export function validateCuratedCorpus(records: CuratedSource[]): CuratedValidationIssue[] {
  const issues: CuratedValidationIssue[] = []

  const seenIds = new Set<string>()
  for (const record of records) {
    const id = record.source_id || '(missing id)'

    if (record.source_id) {
      if (seenIds.has(record.source_id)) {
        issues.push({ source_id: id, issue: `Duplicate source_id: ${record.source_id}` })
      }
      seenIds.add(record.source_id)
    }

    const recordIssues = validateCuratedSource(record)
    for (const issue of recordIssues) {
      issues.push({ source_id: id, issue })
    }
  }

  return issues
}

/**
 * Confirms that a curated record's source_id and url match an entry in the
 * approved source catalogue (knowledge/sources.yaml), establishing
 * provenance traceability.
 */
export function traceCuratedSourceToCatalogue(
  curated: CuratedSource,
  catalogueSources: { id: string; url: string }[]
): boolean {
  return catalogueSources.some((s) => s.id === curated.source_id && s.url === curated.url)
}
