import { Journey } from './routing'
import { getSourceById } from './sources'

/**
 * Deterministic, policy-driven escalation decisions. No model is used:
 * each trigger below is a direct, auditable proxy for a numbered trigger
 * in policies/ESCALATION_POLICY.md. Keyword lists are intentionally
 * narrow — they avoid broad/common terms (e.g. plain "anxiety", which the
 * curated wellness page already addresses informationally) so escalation
 * stays precise and reviewable rather than over-triggering.
 *
 * "Source Error" (ESCALATION_POLICY.md trigger 6) is not implemented here:
 * this engine runs deterministic keyword search over static, already
 * curated content, which does not perform a live fetch and cannot fail at
 * query time. That trigger applies to Day 1/D2's live-retrieval path
 * (lib/sources.ts), not to this routing/escalation layer.
 */

export type EscalationTrigger =
  | 'crisis_or_safety'
  | 'personalized_decision'
  | 'accommodation_request'
  | 'unmatched_query'
  | 'urgent_timeframe'
  | 'none'

export interface EscalationDecision {
  should_escalate: boolean
  trigger: EscalationTrigger
  matched_term: string | null
  target_service_id: string | null
  target_service_title: string | null
  target_service_url: string | null
  reason: string
}

// ESCALATION_POLICY.md trigger 1: Sensitive Personal Information
// (mental health crisis, discrimination, safety concerns).
const CRISIS_SAFETY_TERMS = [
  'crisis', 'suicide', 'suicidal', 'self-harm', 'self harm', 'abuse',
  'assault', 'unsafe', 'emergency', 'violence', 'harassment', 'discrimination',
]

// ESCALATION_POLICY.md trigger 3: Accessibility Accommodations
// (personalized accommodation or assessment requests).
const ACCOMMODATION_TERMS = [
  'accommodation', 'accommodations', 'accessibility assessment', 'my disability',
]

// ESCALATION_POLICY.md trigger 2: Academic/Financial Decisions
// (eligibility, program selection, prerequisites, loan approval).
const PERSONALIZED_DECISION_TERMS = [
  'am i eligible', 'eligibility', 'should i take', 'which program should',
  'loan approval', 'do i qualify', 'prerequisite for',
]

// ESCALATION_POLICY.md trigger 5: Urgent Timeframe.
const URGENT_TERMS = [
  'urgent', 'asap', 'right away', 'immediately', 'deadline is today',
  'deadline tomorrow', 'closing today',
]

// ESCALATION_POLICY.md "Contact Routes" table: journey -> NBCC contact
// source ID in knowledge/sources.yaml.
const JOURNEY_CONTACT_SOURCE: Record<Journey, string> = {
  academic_support: 'NBCC-SS-002',
  accessibility_inclusion: 'NBCC-SS-004',
  wellbeing_safety: 'NBCC-SS-005',
  financial_support: 'NBCC-SS-007',
  general_contact: 'NBCC-SS-007',
}

function findMatch(text: string, terms: string[]): string | null {
  const lower = text.toLowerCase()
  for (const term of terms) {
    if (lower.includes(term)) return term
  }
  return null
}

function resolveTargetService(sourceId: string | null): Pick<EscalationDecision, 'target_service_id' | 'target_service_title' | 'target_service_url'> {
  if (!sourceId) {
    return { target_service_id: null, target_service_title: null, target_service_url: null }
  }
  const source = getSourceById(sourceId)
  return {
    target_service_id: sourceId,
    target_service_title: source?.title ?? null,
    target_service_url: source?.url ?? null,
  }
}

/**
 * Decides whether a query should escalate to human support, per
 * policies/ESCALATION_POLICY.md. Evaluated in the same priority order as
 * the policy's own trigger list (most safety-sensitive first); the first
 * matching trigger wins.
 */
export function decideEscalation(
  query: string,
  journey: Journey,
  retrievalResultCount: number
): EscalationDecision {
  const crisisMatch = findMatch(query, CRISIS_SAFETY_TERMS)
  if (crisisMatch) {
    // Deliberately routes to Wellness and Counselling (NBCC-SS-005) rather
    // than the journey-derived contact: ESCALATION_POLICY.md's Contact
    // Routes table names it explicitly for "Mental health/wellness", and a
    // safety/crisis disclosure must not be routed by whichever domain
    // retrieval happened to rank first. This is intentionally independent
    // of the `journey` parameter/argument.
    return {
      should_escalate: true,
      trigger: 'crisis_or_safety',
      matched_term: crisisMatch,
      ...resolveTargetService(JOURNEY_CONTACT_SOURCE.wellbeing_safety),
      reason: `Query contains a sensitive/safety term ("${crisisMatch}"). Per ESCALATION_POLICY.md trigger 1 (Sensitive Personal Information), this escalates to human support (Wellness and Counselling) rather than an automated answer, independent of retrieval-derived journey.`,
    }
  }

  if (retrievalResultCount === 0) {
    return {
      should_escalate: true,
      trigger: 'unmatched_query',
      matched_term: null,
      ...resolveTargetService(JOURNEY_CONTACT_SOURCE.general_contact),
      reason: 'No approved curated source addressed this query. Per ESCALATION_POLICY.md trigger 4 (Unmatched Query) and ANSWER_POLICY.md ("No Source, No Answer"), this escalates.',
    }
  }

  const accommodationMatch = findMatch(query, ACCOMMODATION_TERMS)
  if (accommodationMatch) {
    return {
      should_escalate: true,
      trigger: 'accommodation_request',
      matched_term: accommodationMatch,
      ...resolveTargetService(JOURNEY_CONTACT_SOURCE.accessibility_inclusion),
      reason: `Query contains an accommodation-related term ("${accommodationMatch}"). Per ESCALATION_POLICY.md trigger 3 (Accessibility Accommodations), personalized accommodation requests require human assessment.`,
    }
  }

  const decisionMatch = findMatch(query, PERSONALIZED_DECISION_TERMS)
  if (decisionMatch) {
    return {
      should_escalate: true,
      trigger: 'personalized_decision',
      matched_term: decisionMatch,
      ...resolveTargetService(JOURNEY_CONTACT_SOURCE[journey]),
      reason: `Query contains a personalized-decision term ("${decisionMatch}"). Per ESCALATION_POLICY.md trigger 2 (Academic/Financial Decisions), this requires human advising rather than an automated answer.`,
    }
  }

  const urgentMatch = findMatch(query, URGENT_TERMS)
  if (urgentMatch) {
    return {
      should_escalate: true,
      trigger: 'urgent_timeframe',
      matched_term: urgentMatch,
      ...resolveTargetService(JOURNEY_CONTACT_SOURCE.general_contact),
      reason: `Query indicates urgency ("${urgentMatch}"). Per ESCALATION_POLICY.md trigger 5 (Urgent Timeframe), this routes to human support for a timely response.`,
    }
  }

  return {
    should_escalate: false,
    trigger: 'none',
    matched_term: null,
    target_service_id: null,
    target_service_title: null,
    target_service_url: null,
    reason: 'No escalation trigger matched. An informational answer from the curated source(s) is appropriate.',
  }
}
