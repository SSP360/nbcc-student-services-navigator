import { searchCuratedSources, RetrievalResult } from './retrieval'

/**
 * Deterministic journey routing over deterministic keyword retrieval
 * results. No model is used: a matched source's `domain` field (already
 * present in the curated corpus, see knowledge/curated/) is mapped to one
 * of five canonical student journeys via a fixed lookup table.
 */

export type Journey =
  | 'academic_support'
  | 'financial_support'
  | 'accessibility_inclusion'
  | 'wellbeing_safety'
  | 'general_contact'

export const JOURNEYS: Journey[] = [
  'academic_support',
  'financial_support',
  'accessibility_inclusion',
  'wellbeing_safety',
  'general_contact',
]

/**
 * Maps a curated source's `domain` field (see knowledge/sources.yaml and
 * knowledge/curated/) to a canonical journey. Domains not present in the
 * current 3-source curated corpus (financial_support, accessibility) are
 * included for forward-compatibility as the corpus grows.
 */
const DOMAIN_TO_JOURNEY: Record<string, Journey> = {
  general_student_services: 'general_contact',
  contact_routing: 'general_contact',
  academic_support: 'academic_support',
  accessibility: 'accessibility_inclusion',
  wellbeing: 'wellbeing_safety',
  financial_support: 'financial_support',
}

export interface RoutingResult {
  journey: Journey
  reason: string
  top_result: RetrievalResult | null
  all_results: RetrievalResult[]
}

/**
 * Routes a free-text query to a journey by running deterministic keyword
 * retrieval and mapping the top-scoring result's domain. If no curated
 * source matches any term, routes to `general_contact` — consistent with
 * ANSWER_POLICY.md's "No Source, No Answer" rule, which requires
 * escalation/human direction rather than a fabricated answer.
 */
export function routeQuery(query: string, results?: RetrievalResult[]): RoutingResult {
  const retrievalResults = results ?? searchCuratedSources(query)

  if (retrievalResults.length === 0) {
    return {
      journey: 'general_contact',
      reason: 'No curated source matched any term in this query; defaulting to general contact per ANSWER_POLICY.md ("No Source, No Answer").',
      top_result: null,
      all_results: [],
    }
  }

  const top = retrievalResults[0]
  const journey = DOMAIN_TO_JOURNEY[top.domain] ?? 'general_contact'

  return {
    journey,
    reason: `Top-matching source ${top.source_id} ("${top.title}", domain: ${top.domain}) scored ${top.score}; mapped to journey "${journey}".`,
    top_result: top,
    all_results: retrievalResults,
  }
}
