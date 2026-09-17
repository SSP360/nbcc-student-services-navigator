import { searchCuratedSources, RetrievalResult } from './retrieval'
import { routeQuery, Journey } from './routing'
import { decideEscalation, EscalationTrigger } from './escalation'

/**
 * Learner-facing pipeline result: the same deterministic retrieval ->
 * routing -> escalation pipeline used by the /dev/* inspectors, reshaped
 * into plain language with no internal scoring/matched-term detail
 * exposed. This is the only shape the public API route
 * (app/api/navigate/route.ts) and the learner UI (app/page.tsx) see.
 */

export interface NavigateSource {
  id: string
  title: string
  url: string
}

export interface NavigateEscalation {
  should_escalate: boolean
  trigger: EscalationTrigger
  message: string
  target: NavigateSource | null
}

export interface NavigateResult {
  query: string
  journey: Journey
  hasSource: boolean
  source: NavigateSource | null
  why: string
  whatToDoNext: string
  escalation: NavigateEscalation
  showImmediateDangerNotice: boolean
}

// Calm, plain-language explanation for each escalation trigger. Deliberately
// does not repeat the raw matched keyword — that is retrieval-debug detail,
// appropriate for /dev/routing but not for a learner-facing result.
function escalationMessage(trigger: EscalationTrigger): string {
  switch (trigger) {
    case 'crisis_or_safety':
      return 'This may involve a safety or crisis concern, so we are connecting you with a person instead of giving an automated answer.'
    case 'accommodation_request':
      return 'Accommodation requests are reviewed individually by a person, so we are connecting you with the right team.'
    case 'personalized_decision':
      return 'This looks like a personal decision (such as eligibility or an approval), which needs a person’s judgement rather than an automated answer.'
    case 'urgent_timeframe':
      return 'This sounds time-sensitive, so we are connecting you directly with NBCC’s team rather than an automated answer.'
    case 'source_error':
      return 'We had a technical problem checking our approved sources, so a person needs to verify this for you.'
    case 'unmatched_query':
      return 'We do not have an approved source for this question, so we are connecting you with NBCC’s general contact team.'
    case 'none':
    default:
      return ''
  }
}

/**
 * Runs the real deterministic pipeline for a learner's question and returns
 * a plain-language, learner-safe result. No model, no external service, no
 * personal data collected or stored — the query is processed in memory for
 * this one request only.
 */
export function navigate(query: string): NavigateResult {
  let results: RetrievalResult[] = []
  let retrievalError: string | null = null
  try {
    results = searchCuratedSources(query)
  } catch (error) {
    retrievalError = error instanceof Error ? error.message : String(error)
  }

  const routing = routeQuery(query, results)
  const escalation = decideEscalation(query, routing.journey, results.length, retrievalError)
  const top = routing.top_result

  const hasSource = Boolean(top)
  const source: NavigateSource | null = top
    ? { id: top.source_id, title: top.title, url: top.url }
    : null

  const target: NavigateSource | null = escalation.target_service_id
    ? {
        id: escalation.target_service_id,
        title: escalation.target_service_title ?? escalation.target_service_id,
        url: escalation.target_service_url ?? '',
      }
    : null

  let why: string
  if (retrievalError) {
    why = 'We could not check our approved sources for this question right now, so this has been passed to a person to verify.'
  } else if (!hasSource) {
    why = 'None of our approved NBCC Student Services sources address this question, so we cannot give an informational answer here.'
  } else {
    why = `Your question matched "${source!.title}", one of NBCC's approved Student Services pages.`
  }

  let whatToDoNext: string
  if (escalation.should_escalate && target) {
    whatToDoNext = target.title.toLowerCase().startsWith('contact')
      ? `${target.title} directly using the details below.`
      : `Contact ${target.title} directly using the details below.`
  } else if (hasSource) {
    whatToDoNext = 'Read the approved information below. If it does not answer your question, contact NBCC directly.'
  } else {
    whatToDoNext = 'Contact NBCC directly using the general contact details below.'
  }

  return {
    query,
    journey: routing.journey,
    hasSource,
    source,
    why,
    whatToDoNext,
    escalation: {
      should_escalate: escalation.should_escalate,
      trigger: escalation.trigger,
      message: escalationMessage(escalation.trigger),
      target,
    },
    showImmediateDangerNotice: routing.journey === 'wellbeing_safety',
  }
}
