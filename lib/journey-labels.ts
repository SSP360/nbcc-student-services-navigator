import { Journey } from './routing'

/**
 * Plain-language journey labels for the learner UI. Deliberately kept in its
 * own module (no runtime dependency on lib/navigate.ts, lib/escalation.ts,
 * or lib/sources.ts) so client components can import it without pulling
 * server-only code (e.g. lib/sources.ts's jsdom-based HTML extraction) into
 * the browser bundle.
 */
export const JOURNEY_LABELS: Record<Journey, string> = {
  academic_support: 'Academic Support',
  financial_support: 'Financial Support',
  accessibility_inclusion: 'Accessibility and Inclusion',
  wellbeing_safety: 'Wellbeing and Safety',
  general_contact: 'General Student Services',
}
