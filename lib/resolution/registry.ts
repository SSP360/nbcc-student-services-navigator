import { ResolutionJourney } from './types'

/**
 * Deterministic phrase/synonym/typo registry for the resolution-first
 * navigator (Phase 2, item 6 of docs/CLAUDE_CODE_P0_AUTONOMOUS_SPRINT_BRIEF.md).
 *
 * This is the *only* place free-text matching rules live. Every entry is a
 * plain, reviewable string — no regex-fu, no stemming library, no model.
 * Changing this registry is how the system's behaviour on a new phrase is
 * changed; tests/resolution-registry.test.ts and
 * tests/resolution-acceptance.test.ts both fail loudly if a change here
 * regresses an existing acceptance case.
 */

/**
 * Safety terms are checked before anything else in the engine (C-04): a
 * match here always produces `safety_escalation`, regardless of any other
 * signal. This list is modeled on, but kept independent of,
 * lib/escalation.ts's `CRISIS_SAFETY_TERMS` — the resolution contract
 * requires its own reviewed, tested registry (see
 * docs/P0_SPRINT_EXECUTION_PLAN.md, "Reusable work identified") rather than
 * silently sharing a list whose governance belongs to a different module.
 */
/**
 * Known out-of-coverage topics (docs/SOURCE_COVERAGE_MATRIX.md's "Explicit
 * current gaps"). A match here forces `unsupported_query` regardless of any
 * other journey term also present in the same query — added after an
 * independent review found that a query like "my student card is broken,
 * can I still study?" was resolving to `confident_route` -> academic_support
 * (the exact forbidden outcome named in F-12) purely because "study" is a
 * registered academic term and no countervailing signal existed to say
 * "this query is fundamentally about something we don't cover." Checked
 * after safety (which always wins) and before ordinary journey matching.
 */
export const OUT_OF_SCOPE_TERMS: string[] = [
  'student card',
  'id card',
  'campus card',
  'replacement card',
  'wifi',
  'wi-fi',
  'wireless internet',
  'internet connection',
  'network connection',
  'transcript',
  'transcripts',
  'parking',
  'library card',
  'off-campus housing',
]

export const SAFETY_TERMS: string[] = [
  'sexual assault',
  'sexually assaulted',
  'assault',
  'assaulted',
  'rape',
  'raped',
  'suicide',
  'suicidal',
  'self-harm',
  'self harm',
  'kill myself',
  'abuse',
  'abused',
  'unsafe',
  'emergency',
  'violence',
  'harassment',
  'harassed',
  'crisis',
  'in danger',
  'threatened',
]

/**
 * Generic terms appear across many/most journeys and carry no topical
 * signal on their own (C-01: "Generic terms cannot alone create a
 * confident route"). They are tracked (not just ignored) so the engine can
 * distinguish "no signal at all" from "a generic request for guidance" —
 * both currently resolve to `unsupported_query` per the acceptance
 * contract's allowed states for F-12/F-13/F-14, but keeping them separate
 * makes that a deliberate, visible decision rather than an accident of
 * what the registry happens to contain.
 */
export const GENERIC_TERMS: string[] = [
  'help',
  'need',
  'support',
  'student',
  'students',
  'service',
  'services',
  'nbcc',
  'college',
  'campus',
  'information',
  'question',
  'issue',
  'problem',
]

export interface PhraseEntry {
  term: string
  journey: ResolutionJourney
  /** Free-text note on why this entry exists — e.g. a documented typo. */
  note?: string
}

/**
 * Meaningful, journey-specific terms and phrases, including reviewed
 * synonyms and one documented common typo (F-10: "accomodation"). A term
 * appearing here for exactly one journey is what allows `confident_route`;
 * a query matching terms from two or more journeys is multi-intent and
 * never silently resolved to one of them (F-15).
 */
export const PHRASE_REGISTRY: PhraseEntry[] = [
  // academic_support
  { term: 'academic', journey: 'academic_support' },
  { term: 'study', journey: 'academic_support' },
  { term: 'studying', journey: 'academic_support' },
  // Deliberately NOT registering bare "exam"/"exams" for academic_support:
  // "extra time on an exam" is an accessibility-accommodation phrase, not
  // an academic-help phrase, and "exam" alone would collide with
  // accessibility's "extra time" (F-09 requires confident_route ->
  // accessibility, not a multi-intent guided_choice). Academic exam-related
  // help is still reachable via "studying"/"tutoring"/"coaching" etc.
  { term: 'tutoring', journey: 'academic_support' },
  { term: 'tutor', journey: 'academic_support' },
  { term: 'coaching', journey: 'academic_support' },
  { term: 'success coach', journey: 'academic_support' },
  { term: 'grades', journey: 'academic_support' },
  { term: 'coursework', journey: 'academic_support' },
  { term: 'transition to college', journey: 'academic_support' },

  // financial_support
  { term: 'financial', journey: 'financial_support' },
  { term: 'fees', journey: 'financial_support' },
  { term: 'fee', journey: 'financial_support' },
  { term: 'money', journey: 'financial_support' },
  { term: 'broke', journey: 'financial_support' },
  { term: 'loan', journey: 'financial_support' },
  { term: 'loans', journey: 'financial_support' },
  { term: 'funding', journey: 'financial_support' },
  { term: 'tuition', journey: 'financial_support' },
  { term: 'financial aid', journey: 'financial_support' },

  // accessibility
  { term: 'accessibility', journey: 'accessibility' },
  { term: 'accommodation', journey: 'accessibility' },
  { term: 'accommodations', journey: 'accessibility' },
  { term: 'accomodation', journey: 'accessibility', note: 'common typo for "accommodation" (F-10)' },
  { term: 'accomodations', journey: 'accessibility', note: 'common typo for "accommodations"' },
  { term: 'disability', journey: 'accessibility' },
  { term: 'disabilities', journey: 'accessibility' },
  { term: 'extra time', journey: 'accessibility' },
  { term: 'learning barrier', journey: 'accessibility' },

  // wellbeing_safety (non-crisis, informational terms; crisis terms live in
  // SAFETY_TERMS above and are checked first, independently)
  { term: 'wellbeing', journey: 'wellbeing_safety' },
  { term: 'counselling', journey: 'wellbeing_safety' },
  { term: 'counseling', journey: 'wellbeing_safety' },
  { term: 'mental health', journey: 'wellbeing_safety' },
  { term: 'stress', journey: 'wellbeing_safety' },
  { term: 'stressed', journey: 'wellbeing_safety' },
  { term: 'anxious', journey: 'wellbeing_safety' },
  { term: 'anxiety', journey: 'wellbeing_safety' },

  // general_student_services
  { term: 'general student services', journey: 'general_student_services' },
  { term: 'contact nbcc', journey: 'general_student_services' },
]

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalize(text: string): string {
  // Curly apostrophes (as used in the acceptance fixture, e.g. "I'm broke")
  // are normalized to straight ones so registry entries never need to
  // special-case Unicode punctuation.
  return text.toLowerCase().replace(/[‘’]/g, "'")
}

function containsTerm(lowerText: string, term: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegExp(term.toLowerCase())}\\b`)
  return pattern.test(lowerText)
}

/** True if any reviewed safety term is present in the query (checked first, always). */
export function matchesSafetyTerm(query: string): string | null {
  const lower = normalize(query)
  return SAFETY_TERMS.find((t) => containsTerm(lower, t)) ?? null
}

/** Which generic (non-topical) terms are present, if any. */
export function matchGenericTerms(query: string): string[] {
  const lower = normalize(query)
  return GENERIC_TERMS.filter((t) => containsTerm(lower, t))
}

/** True if a known out-of-coverage topic is present (see OUT_OF_SCOPE_TERMS above). */
export function matchesOutOfScopeTerm(query: string): string | null {
  const lower = normalize(query)
  return OUT_OF_SCOPE_TERMS.find((t) => containsTerm(lower, t)) ?? null
}

/**
 * Which journeys have at least one meaningful registry term present, and
 * which terms matched. A query with hits in exactly one journey is a
 * candidate for `confident_route`; a query with hits in two or more is
 * multi-intent (F-15) and must never be silently narrowed to one.
 */
export function matchJourneys(query: string): Map<ResolutionJourney, string[]> {
  const lower = normalize(query)
  const result = new Map<ResolutionJourney, string[]>()
  for (const entry of PHRASE_REGISTRY) {
    if (containsTerm(lower, entry.term)) {
      const existing = result.get(entry.journey) ?? []
      existing.push(entry.term)
      result.set(entry.journey, existing)
    }
  }
  return result
}
