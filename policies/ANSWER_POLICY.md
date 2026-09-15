# Answer Policy

## Scope

This policy governs how the NBCC Student Services Navigator generates and delivers answers to student inquiries.

## Approved Information Sources

1. Only approved sources in `knowledge/sources.yaml` may be used to answer student questions.
2. All sources must have `authority: nbcc_public` and `review_status: prototype_public_source`.
3. Source content must be current and retrieved within the time-sensitivity window defined in the source record.

## Answer Requirements

1. **Accuracy**: All answers must be traceable to an approved source. No invented policies, deadlines, contacts, URLs, or outcomes.
2. **Attribution**: Each answer must identify the source by ID and title.
3. **Scope**: Answers are limited to information available in approved sources.
4. **No Source, No Answer**: If no approved source addresses the student's question, the application must escalate or direct to human contact.

## Prohibited Answers

- Financial, legal, medical, or accessibility advice that requires personalized assessment.
- Student-specific decisions (e.g., eligibility, program fit, accommodation approval).
- Information contradicting the source material.
- Fabricated contact information, deadlines, or process steps.

## Escalation

For sensitive or complex questions, see ESCALATION_POLICY.md.

## Future

On-LLM integration (Day 2+), answer quality will be evaluated against golden questions and sensitive test cases in `/evals`.
