import { CuratedSource, loadAllCuratedSources } from './curated-sources'

/**
 * Deterministic keyword retrieval over the curated content corpus.
 *
 * No model, embedding, or external service is used. Matching is a
 * transparent, reproducible term-overlap score so every result can
 * explain exactly which query terms matched and where.
 *
 * Document-frequency exclusive-term weighting (Day 4 / D2-FU-01):
 * a query term that occurs in the body text of exactly one curated
 * document is a strong, unambiguous discriminator — by definition, no
 * other curated source can be confused with it on that term. Such terms
 * receive a fixed multiplier on their body-match contribution. Terms
 * that occur in more than one curated document's body (generic,
 * cross-cutting words such as "support" or "campus") are left at the
 * standard weight, since their presence cannot help distinguish between
 * sources. This is a general, reusable, fully deterministic technique
 * (a simple discrete form of inverse-document-frequency weighting) —
 * it is not keyed to any specific query or source.
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

/**
 * Multiplier applied to a term's body-occurrence contribution when that
 * term occurs in exactly one curated document's body text (i.e. its
 * corpus-wide document frequency is 1). See lib/retrieval.ts module
 * comment and learning-log/DAY_04.md for the diagnosis and empirical
 * verification behind this constant.
 */
const EXCLUSIVE_TERM_DOCUMENT_FREQUENCY = 1
const EXCLUSIVE_TERM_MULTIPLIER = 3

export interface MatchedTerm {
  term: string
  inTitle: boolean
  inDomain: boolean
  bodyOccurrences: number
  /** Number of curated documents whose body text contains this term at least once. */
  documentFrequency: number
  /** True when this term's body-occurrence contribution received the exclusive-term multiplier. */
  isExclusiveTerm: boolean
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
 * Computes, for each given query term, how many of the given documents'
 * body text contains that term at least once. Deterministic and
 * corpus-derived — no fixed list, no external data.
 */
function computeDocumentFrequencies(queryTerms: string[], bodiesLower: string[]): Map<string, number> {
  const df = new Map<string, number>()
  for (const term of queryTerms) {
    let count = 0
    for (const body of bodiesLower) {
      if (body.includes(term)) count++
    }
    df.set(term, count)
  }
  return df
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

  const bodiesLower = corpus.map((s) => s.extracted_text.toLowerCase())
  const documentFrequencies = computeDocumentFrequencies(queryTerms, bodiesLower)

  const results: RetrievalResult[] = []

  corpus.forEach((source, index) => {
    const titleLower = source.title.toLowerCase()
    const domainLower = source.domain.toLowerCase()
    const bodyLower = bodiesLower[index]

    let score = 0
    const matchedTerms: MatchedTerm[] = []
    let firstMatchedTerm: string | null = null

    for (const term of queryTerms) {
      const inTitle = titleLower.includes(term)
      const inDomain = domainLower.includes(term)
      const bodyOccurrences = countOccurrences(bodyLower, term)
      const documentFrequency = documentFrequencies.get(term) ?? 0
      const isExclusiveTerm = bodyOccurrences > 0 && documentFrequency === EXCLUSIVE_TERM_DOCUMENT_FREQUENCY
      const bodyMultiplier = isExclusiveTerm ? EXCLUSIVE_TERM_MULTIPLIER : 1

      if (inTitle || inDomain || bodyOccurrences > 0) {
        matchedTerms.push({ term, inTitle, inDomain, bodyOccurrences, documentFrequency, isExclusiveTerm })
        score +=
          (inTitle ? TITLE_WEIGHT : 0) +
          (inDomain ? DOMAIN_WEIGHT : 0) +
          bodyOccurrences * BODY_WEIGHT * bodyMultiplier
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
  })

  results.sort((a, b) => b.score - a.score)
  return results
}
