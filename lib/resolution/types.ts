/**
 * Foundation types for the P0 resolution-first navigator, per
 * docs/RESOLUTION_READY_ACCEPTANCE_MATRIX.md ("Resolution states" and
 * "Source governance requirements" sections) and
 * docs/CLAUDE_CODE_P0_AUTONOMOUS_SPRINT_BRIEF.md ("Phase 1: shared foundation").
 *
 * This module defines the contract only — no scoring, no matching, no UI.
 * P0.1 (engine/registry) and P0.2 (sources) build on top of it.
 */

/** The five resolution states named in the acceptance matrix. No sixth state exists. */
export type ResolutionState =
  | 'confident_route'
  | 'guided_choice'
  | 'human_assisted'
  | 'unsupported_query'
  | 'safety_escalation'

/**
 * Internal reason codes explaining *why* a state was chosen. These are for
 * logs/tests/debugging only and must never be rendered to a learner or
 * returned from a learner-facing API (C-07 / "Do not expose ... internal
 * reason codes ... in learner-facing UI/API output").
 */
export type InternalReasonCode =
  | 'safety_term_matched'
  | 'single_journey_strong_match'
  | 'single_journey_weak_match'
  | 'multi_journey_match'
  | 'no_meaningful_match'
  | 'source_ineligible_for_confident_route'
  | 'explicit_category_selection'
  | 'explicit_urgent_selection'
  | 'explicit_recovery_selection'
  | 'explicit_uncertain_selection'

/**
 * The five canonical resolution journeys. Deliberately distinct from the
 * legacy `Journey` type in lib/routing.ts (`accessibility_inclusion`,
 * `general_contact`) — the acceptance contract
 * (evals/resolution-acceptance-cases.ts) uses `accessibility` and
 * `general_student_services`, and those names are not renamed or
 * reinterpreted here.
 */
export type ResolutionJourney =
  | 'academic_support'
  | 'financial_support'
  | 'accessibility'
  | 'wellbeing_safety'
  | 'general_student_services'

export const RESOLUTION_JOURNEYS: ResolutionJourney[] = [
  'academic_support',
  'financial_support',
  'accessibility',
  'wellbeing_safety',
  'general_student_services',
]

/**
 * The four supported source lifecycle statuses (G-02). Only `active`
 * sources may support a `confident_route` (G-03, G-04); `needs_review`
 * behaviour is explicit and deterministic (G-05), never silently treated as
 * active.
 */
export type SourceStatus = 'active' | 'needs_review' | 'unavailable' | 'retired'

/**
 * A source is eligible to support a `confident_route` only when it is
 * `active`. `needs_review`, `unavailable`, and `retired` sources may still
 * be used to explain a `human_assisted` or `unsupported_query` outcome
 * (e.g. "the usual source for this is under review, here is a human
 * contact instead"), but must never back a confident recommendation.
 *
 * This is the single source-status eligibility rule referenced by G-03 and
 * G-04; both P0.1's engine and P0.2's source-validation tests call this
 * function rather than re-deriving the rule independently.
 */
export function isEligibleForConfidentRoute(status: SourceStatus): boolean {
  return status === 'active'
}

/** Safe, typed source metadata (G-01). No internal review notes or owner
 * contact details beyond a public-facing name are included here — those
 * belong in docs/SOURCE_COVERAGE_MATRIX.md / docs/SOURCE_ONBOARDING.md, not
 * in a structure any API response could accidentally serialize. */
export interface ApprovedSourceMeta {
  id: string
  journey: ResolutionJourney
  title: string
  /** Must be an HTTPS URL on the existing ALLOWED_DOMAINS allowlist (lib/types.ts). */
  url: string
  /** Public-facing owning team name, e.g. "Student Success Coaching" — not a personal contact. */
  owner: string
  status: SourceStatus
  /** ISO-8601 date the source was last reviewed for accuracy/availability. */
  lastReviewedAt: string
  /** Optional: when a needs_review/unavailable status is expected to change. */
  reviewDueBy?: string
}

/**
 * A single, plain-language next action shown to the learner. Never contains
 * a score, matched term, or internal reason code.
 */
export interface ResolutionAction {
  label: string
  href?: string
}

/**
 * The safe, learner-facing result contract. This is the *only* shape any
 * learner-facing API or UI component may consume — it is constructed by
 * lib/resolution/engine.ts and never carries raw scores, matched terms,
 * internal reason codes, or source-review notes (C-07).
 */
export interface ResolutionResult {
  state: ResolutionState
  message: string
  journey?: ResolutionJourney
  source?: { id: string; title: string; url: string }
  primaryAction: ResolutionAction
  /** Always present except during safety_escalation, where the safety action is primary. */
  recoveryAction: ResolutionAction
  /** Present only for guided_choice: the fixed set of plain-language options offered. */
  options?: { label: string; journey: ResolutionJourney | 'general_student_services' | 'unsure' }[]
  /** Present only for safety_escalation. */
  escalation?: { message: string; action: ResolutionAction }
}

/**
 * Safety-first precedence rule (C-04): a caller must check for a safety
 * trigger before doing anything else — confidence scoring, clarification,
 * or normal navigation. This function exists so that rule is enforced by a
 * single, tested, importable check rather than by convention across call
 * sites (engine.ts, the free-text handler, and any future entry point all
 * call this first).
 */
export function safetyOverridesEverything(hasSafetyTrigger: boolean): boolean {
  return hasSafetyTrigger === true
}
