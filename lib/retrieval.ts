import { CuratedSource, loadAllCuratedSources } from './curated-sources'

/**
 * Deterministic keyword retrieval over the curated content corpus.
 *
 * No model, embedding, or external service is used. Matching is a
 * transparent, reproducible term-overlap score so every result can
 * explain exactly which query terms matched and where.
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'to', 'of', 'for', 'and', 'or', 'but', 'if', 'then', 'than', 'so',
  'in', 'on', 'at', 'by', 'with', 'about', 'into', 'through', 'during',
  'my', 'your', 'their', 'our', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should', 'may', 'might',
  'what', 'where', 'when', 'who', 'whom', 'which', 'how', 'why',
  'this', 'that', 'these', 'those', 'there', 'here',
  'have', 'has', 'had', 'not', 'no', 'yes', 'as', 'from', 'up', 'down', 'out',
  'me', 'am',
])

const TITLE_WEIGHT = 5
const DOMAIN_WEIGHT = 3
const BODY_WEIGHT = 1

export interface MatchedTerm {
  term: string
  inTitle: boolean
  inDomain: boolean
  bodyOccurrences: number
}

export interface RetrievalResult {
  source_id: string
  title: string
  url: string
  domain: string
  score: number
  matched_terms: MatchedTerm[]
  snippet: string
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0
  let count = 0
  let idx = 0
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    count++
    idx += needle.length
  }
  return count
}

function buildSnippet(body: string, term: string, radius = 90): string {
  const lowerBody = body.toLowerCase()
  const idx = lowerBody.indexOf(term)
  if (idx === -1) return ''
  const start = Math.max(0, idx - radius)
  const end = Math.min(body.length, idx + term.length + radius)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < body.length ? '…' : ''
  return prefix + body.substring(start, end).replace(/\s+/g, ' ').trim() + suffix
}

/**
 * Search the curated corpus for a free-text query. Returns results ordered
 * by descending score; only sources with at least one matched term are
 * included. Pass an explicit `sources` array in tests to avoid depending on
 * disk state.
 */
export function searchCuratedSources(query: string, sources?: CuratedSource[]): RetrievalResult[] {
  const corpus = sources ?? loadAllCuratedSources()
  const queryTerms = Array.from(new Set(tokenize(query)))

  if (queryTerms.length === 0) {
    return []
  }

  const results: RetrievalResult[] = []

  for (const source of corpus) {
    const titleLower = source.title.toLowerCase()
    const domainLower = source.domain.toLowerCase()
    const bodyLower = source.extracted_text.toLowerCase()

    let score = 0
    const matchedTerms: MatchedTerm[] = []
    let firstMatchedTerm: string | null = null

    for (const term of queryTerms) {
      const inTitle = titleLower.includes(term)
      const inDomain = domainLower.includes(term)
      const bodyOccurrences = countOccurrences(bodyLower, term)

      if (inTitle || inDomain || bodyOccurrences > 0) {
        matchedTerms.push({ term, inTitle, inDomain, bodyOccurrences })
        score += (inTitle ? TITLE_WEIGHT : 0) + (inDomain ? DOMAIN_WEIGHT : 0) + bodyOccurrences * BODY_WEIGHT
        if (!firstMatchedTerm) firstMatchedTerm = term
      }
    }

    if (score > 0) {
      results.push({
        source_id: source.source_id,
        title: source.title,
        url: source.url,
        domain: source.domain,
        score,
        matched_terms: matchedTerms,
        snippet: firstMatchedTerm ? buildSnippet(source.extracted_text, firstMatchedTerm) : '',
      })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results
}
