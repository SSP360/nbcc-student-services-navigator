import { ResolutionJourney, ResolutionResult, ResolutionState, safetyOverridesEverything } from './types'
import { getActiveSourcesForJourney, getApprovedSourceById } from './sources'
import { matchesSafetyTerm, matchesOutOfScopeTerm, matchJourneys } from './registry'

/**
 * The resolution-first navigation engine (P0.1). Every public function here
 * returns a `ResolutionResult` — the safe, learner-facing shape from
 * lib/resolution/types.ts. No raw score, matched-term list, or internal
 * reason code is ever included in a returned result (C-07); those exist
 * only as local variables/console-free intermediate values during
 * resolution and are discardable after the state decision is made.
 *
 * Confidence-gate design (documented constants, C-06):
 *
 * - MIN_MEANINGFUL_TERMS_FOR_CONFIDENT_ROUTE = 1: a single meaningful,
 *   journey-specific term (e.g. "exam", "accommodation", "loan") is a
 *   strong, unambiguous signal in a 5-journey system with a reviewed
 *   registry — unlike a generic term, which by definition says nothing
 *   about which journey applies (C-01).
 * - The "margin" requirement (C-01's sibling: a first-vs-second-place gap)
 *   is enforced structurally, not numerically: `confident_route` requires
 *   that meaningful terms were found for EXACTLY ONE journey. If a second
 *   journey has even one meaningful-term hit, the result is `guided_choice`
 *   (multi-intent, F-15) rather than picking a "winner" by count. This is
 *   the strictest possible margin rule a discrete registry can enforce —
 *   there is no scenario where a close-second journey is silently
 *   discarded.
 */

/**
 * A single meaningful, journey-specific registry term (see
 * lib/resolution/registry.ts) is sufficient evidence for a confident route
 * (C-01, C-06) — documented and versioned here as a named constant so any
 * future change to this threshold is a reviewable, one-line diff.
 */
export const MIN_MEANINGFUL_TERMS_FOR_CONFIDENT_ROUTE = 1

/**
 * The required first-vs-second-place margin (C-06): `confident_route` is
 * only reachable when the SECOND-best journey has strictly fewer than this
 * many meaningful-term matches. Set to 1, combined with the engine's
 * "exactly one journey matched" gate below, this means any second journey
 * with even a single meaningful hit blocks confident_route in favour of
 * `guided_choice` — the strictest margin a discrete registry can express.
 */
export const MIN_SECOND_PLACE_MARGIN = 1

const GENERAL_JOURNEY: ResolutionJourney = 'general_student_services'

function sourceMetaOf(journey: ResolutionJourney) {
  const [active] = getActiveSourcesForJourney(journey)
  return active
}

function generalRecoverySource() {
  // NBCC-SS-001 (Student Services at NBCC) is the primary general route;
  // fall back to NBCC-SS-007 (Contact NBCC) if it were ever ineligible.
  return sourceMetaOf(GENERAL_JOURNEY) ?? getApprovedSourceById('NBCC-SS-007')
}

function recoveryAction(): ResolutionResult['recoveryAction'] {
  const source = generalRecoverySource()
  return {
    label: 'Not the right service? Choose a different area or contact General Student Services',
    href: source?.url,
  }
}

/** Safety escalation — always wins, regardless of any other input (C-04). */
export function buildSafetyEscalation(): ResolutionResult {
  const safetySource = sourceMetaOf('wellbeing_safety')
  return {
    state: 'safety_escalation',
    message:
      'This may involve a safety or crisis concern. You are being connected with urgent human support instead of an automated answer.',
    journey: 'wellbeing_safety',
    source: safetySource ? { id: safetySource.id, title: safetySource.title, url: safetySource.url } : undefined,
    primaryAction: { label: 'Get urgent help now', href: safetySource?.url },
    recoveryAction: recoveryAction(),
    escalation: {
      message: 'If you are in immediate danger, contact local emergency services.',
      action: { label: 'Get urgent help now', href: safetySource?.url },
    },
  }
}

/** No meaningful, no-coverage, or unsafe-to-guess request (C-02). Never a dead end (F-18). */
export function buildUnsupportedQuery(): ResolutionResult {
  const general = generalRecoverySource()
  return {
    state: 'unsupported_query',
    message:
      "We don't have a specific match for this request. We can't guess, so here is how to reach General Student Services, who can help or point you to the right place.",
    journey: GENERAL_JOURNEY,
    source: general ? { id: general.id, title: general.title, url: general.url } : undefined,
    primaryAction: { label: 'Contact General Student Services', href: general?.url },
    recoveryAction: { label: 'Choose a category instead', href: undefined },
  }
}

/** Close, plausible, low-risk, or multi-intent need (F-15). Fixed choices, never a free-text loop. */
export function buildGuidedChoice(): ResolutionResult {
  const options: ResolutionResult['options'] = [
    { label: 'Academic support', journey: 'academic_support' },
    { label: 'Money, fees, and financial aid', journey: 'financial_support' },
    { label: 'Accommodations and accessibility', journey: 'accessibility' },
    { label: 'Wellbeing and safety', journey: 'wellbeing_safety' },
    { label: 'General student services', journey: 'general_student_services' },
    { label: "I'm not sure", journey: 'unsure' },
  ]
  // Deliberately does not name the matched internal journey keys in the
  // message (an earlier version interpolated them, e.g. "...involve more
  // than one area: financial_support, accessibility..." — an internal
  // identifier leak into learner-facing text, found by independent review,
  // and also plain-language-unfriendly, A-08). The options list below
  // already gives the student every plain-language choice; the prose does
  // not need to repeat it in internal form.
  return {
    state: 'guided_choice',
    message: "This could involve more than one area. Choose the one that best matches what you need right now, or say you're not sure.",
    primaryAction: { label: 'Choose the closest match below', href: undefined },
    recoveryAction: recoveryAction(),
    options,
  }
}

/** Personalised, policy-sensitive, or judgment-required matters, or a journey with no active source. */
export function buildHumanAssisted(journey: ResolutionJourney): ResolutionResult {
  const anySource = getApprovedSourceById(sourceMetaOf(journey)?.id ?? '') ?? generalRecoverySource()
  return {
    state: 'human_assisted',
    message:
      'This needs a person’s judgement rather than an automated answer. Here is the named human service that can help.',
    journey,
    source: anySource ? { id: anySource.id, title: anySource.title, url: anySource.url } : undefined,
    primaryAction: { label: `Contact ${anySource?.title ?? 'the right team'}`, href: anySource?.url },
    recoveryAction: recoveryAction(),
  }
}

/** Strong approved active-source evidence for exactly one journey. */
export function buildConfidentRoute(journey: ResolutionJourney): ResolutionResult {
  const source = sourceMetaOf(journey)
  if (!source) {
    // G-04: status prevents ordinary routing -> safe fallback, never a
    // confident recommendation with no eligible source behind it.
    return buildHumanAssisted(journey)
  }
  return {
    state: 'confident_route',
    message: `Based on what you shared, ${source.title} is the right place to start.`,
    journey,
    source: { id: source.id, title: source.title, url: source.url },
    primaryAction: { label: `Visit ${source.title}`, href: source.url },
    recoveryAction: recoveryAction(),
  }
}

/**
 * Resolves a free-text learner query. Safety is checked before anything
 * else (C-04); everything after that is deterministic keyword matching
 * against lib/resolution/registry.ts — no model, no external service.
 */
export function resolveFreeText(query: string): ResolutionResult {
  const trimmed = query.trim()

  const safetyTerm = matchesSafetyTerm(trimmed)
  if (safetyOverridesEverything(Boolean(safetyTerm))) {
    return buildSafetyEscalation()
  }

  if (!trimmed) {
    return buildUnsupportedQuery()
  }

  // A known out-of-coverage topic (e.g. "student card", "wifi") forces
  // unsupported_query even when the query also happens to contain another
  // journey's meaningful term (e.g. "my student card is broken, can I
  // still study?") — otherwise a single incidental word could produce a
  // confident but wrong route to an unrelated service, which is exactly
  // what F-12/F-13 forbid. Checked before ordinary journey matching.
  if (matchesOutOfScopeTerm(trimmed)) {
    return buildUnsupportedQuery()
  }

  const journeyMatches = matchJourneys(trimmed)
  const journeysWithMatch = Array.from(journeyMatches.keys()).filter(
    (j) => (journeyMatches.get(j) ?? []).length >= MIN_MEANINGFUL_TERMS_FOR_CONFIDENT_ROUTE
  )

  if (journeysWithMatch.length === 0) {
    return buildUnsupportedQuery()
  }

  // Second-place margin check: any journey beyond the first with at least
  // MIN_SECOND_PLACE_MARGIN meaningful hits blocks a confident route.
  if (journeysWithMatch.length >= 1 + MIN_SECOND_PLACE_MARGIN) {
    return buildGuidedChoice()
  }

  return buildConfidentRoute(journeysWithMatch[0])
}

/** Fixed category keys for the dual-entry home (Phase 2, item 1). */
export type CategoryKey =
  | 'academic_support'
  | 'financial_support'
  | 'accessibility'
  | 'wellbeing_safety'
  | 'general_student_services'
  | 'unsure'
  | 'urgent'

/**
 * Resolves a direct category selection. A category click never requires
 * free text (F-01, F-03) and never runs retrieval (F-05's "no unrelated
 * retrieval") — it is a direct, fixed mapping.
 */
export function resolveCategory(category: CategoryKey): ResolutionResult {
  if (category === 'urgent') {
    return buildSafetyEscalation()
  }
  if (category === 'unsure') {
    return buildGuidedChoice()
  }
  return buildConfidentRoute(category)
}

/** F-18: "This is not the right service." Never a dead end. */
export function resolveRecovery(): ResolutionResult {
  return buildGuidedChoice()
}

export type { ResolutionState, ResolutionResult, ResolutionJourney }
