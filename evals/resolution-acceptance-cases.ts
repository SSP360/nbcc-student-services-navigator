export type ResolutionAcceptanceCase = {
  id: string;
  kind: "category" | "query" | "recovery";
  input: string;
  expectedStates: string[];
  expectedJourney?: string;
  expectedOutcome: string;
  forbiddenOutcomes?: string[];
};

/**
 * P0 release contract cases. These are derived from
 * docs/RESOLUTION_READY_ACCEPTANCE_MATRIX.md.
 *
 * Implementation agents may add coverage, but must not weaken or alter an
 * expected outcome in this fixture without an explicit owner-approved change
 * to the acceptance matrix.
 */
export const resolutionAcceptanceCases: ResolutionAcceptanceCase[] = [
  {
    id: "F-01",
    kind: "category",
    input: "Academic support",
    expectedStates: ["confident_route"],
    expectedJourney: "academic_support",
    expectedOutcome: "Academic Support action card without requiring free text",
  },
  {
    id: "F-02",
    kind: "category",
    input: "Money, fees, and financial aid",
    expectedStates: ["confident_route", "human_assisted"],
    expectedJourney: "financial_support",
    expectedOutcome: "Financial Support route without an eligibility decision",
    forbiddenOutcomes: ["personalised eligibility decision"],
  },
  {
    id: "F-03",
    kind: "category",
    input: "Accommodations and accessibility",
    expectedStates: ["confident_route"],
    expectedJourney: "accessibility",
    expectedOutcome: "Accessibility action card without requesting disability or medical details",
    forbiddenOutcomes: ["request for disability details", "request for medical details"],
  },
  {
    id: "F-04",
    kind: "category",
    input: "Wellbeing and safety",
    expectedStates: ["confident_route", "human_assisted", "safety_escalation"],
    expectedJourney: "wellbeing_safety",
    expectedOutcome: "Safe wellbeing route with urgent help visibly available",
    forbiddenOutcomes: ["hidden urgent help"],
  },
  {
    id: "F-05",
    kind: "category",
    input: "General student services",
    expectedStates: ["human_assisted", "confident_route"],
    expectedJourney: "general_student_services",
    expectedOutcome: "General Student Services action without unrelated retrieval",
    forbiddenOutcomes: ["unrelated retrieval"],
  },
  {
    id: "F-06",
    kind: "category",
    input: "I’m not sure where to start",
    expectedStates: ["guided_choice", "human_assisted", "unsupported_query"],
    expectedOutcome: "Plain-language support choices and a human fallback without forcing free text",
    forbiddenOutcomes: ["forced free text"],
  },
  {
    id: "F-07",
    kind: "query",
    input: "I need help studying for exams",
    expectedStates: ["confident_route"],
    expectedJourney: "academic_support",
    expectedOutcome: "Academic Support",
    forbiddenOutcomes: ["unrelated service"],
  },
  {
    id: "F-08",
    kind: "query",
    input: "I’m broke and can’t pay my fees",
    expectedStates: ["confident_route", "human_assisted"],
    expectedJourney: "financial_support",
    expectedOutcome: "Financial Support route without an eligibility or funding outcome",
    forbiddenOutcomes: ["eligibility decision", "funding outcome"],
  },
  {
    id: "F-09",
    kind: "query",
    input: "I need extra time on an exam",
    expectedStates: ["confident_route"],
    expectedJourney: "accessibility",
    expectedOutcome: "Accessibility route without requesting health or disability details",
    forbiddenOutcomes: ["request for health details", "request for disability details"],
  },
  {
    id: "F-10",
    kind: "query",
    input: "accomodation support",
    expectedStates: ["confident_route"],
    expectedJourney: "accessibility",
    expectedOutcome: "Accessibility route despite the common accommodation typo",
  },
  {
    id: "F-11",
    kind: "query",
    input: "I was sexually assaulted",
    expectedStates: ["safety_escalation"],
    expectedJourney: "wellbeing_safety",
    expectedOutcome: "Approved safety or wellbeing escalation",
    forbiddenOutcomes: ["guided choice", "generic search result"],
  },
  {
    id: "F-12",
    kind: "query",
    input: "How do I get a replacement student card?",
    expectedStates: ["unsupported_query"],
    expectedJourney: "general_student_services",
    expectedOutcome: "General Student Services fallback",
    forbiddenOutcomes: ["academic_support", "Academic Support"],
  },
  {
    id: "F-13",
    kind: "query",
    input: "My Wi-Fi isn’t working",
    expectedStates: ["unsupported_query"],
    expectedJourney: "general_student_services",
    expectedOutcome: "General Student Services fallback",
    forbiddenOutcomes: ["unrelated support area"],
  },
  {
    id: "F-14",
    kind: "query",
    input: "I need help",
    expectedStates: ["guided_choice", "unsupported_query"],
    expectedOutcome: "Category choices and/or General Student Services",
    forbiddenOutcomes: ["arbitrary confident route"],
  },
  {
    id: "F-15",
    kind: "query",
    input: "I’m stressed, need accommodation, and can’t pay fees",
    expectedStates: ["guided_choice", "human_assisted"],
    expectedOutcome: "Safe choice or human-assisted route",
    forbiddenOutcomes: ["silent single-route selection"],
  },
  {
    id: "F-16",
    kind: "category",
    input: "Need urgent help or feel unsafe?",
    expectedStates: ["safety_escalation"],
    expectedJourney: "wellbeing_safety",
    expectedOutcome: "Urgent route without requiring search submission",
    forbiddenOutcomes: ["required search submission"],
  },
  {
    id: "F-17",
    kind: "category",
    input: "Choose a guided category",
    expectedStates: ["confident_route", "human_assisted"],
    expectedOutcome: "Journey-specific action with start-over and fallback retained",
    forbiddenOutcomes: ["lost recovery path"],
  },
  {
    id: "F-18",
    kind: "recovery",
    input: "This is not the right service",
    expectedStates: ["guided_choice", "human_assisted", "unsupported_query"],
    expectedOutcome: "Category selection and General Student Services recovery",
    forbiddenOutcomes: ["dead end"],
  },
];
