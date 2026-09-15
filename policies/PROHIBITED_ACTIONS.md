# Prohibited Actions

## Application Behaviour

The NBCC Student Services Navigator must never:

1. **Collect Personal Data**: Store, transmit, or process student names, email addresses, student IDs, financial information, health records, or any personally identifiable information.

2. **Authenticate Students**: Require login, passwords, or student credentials.

3. **Store Conversation History**: Save or log student questions between sessions.

4. **Make Autonomous Decisions**: Approve accommodations, determine eligibility, issue financial awards, or make academic decisions on behalf of the student.

5. **Integrate with Student Systems**: Connect to SIMS, Brightspace, Microsoft systems, or any institutional database without explicit human authorization per interaction.

6. **Use Unauthorized Sources**: Answer from sources outside `knowledge/sources.yaml`.

7. **Modify Source Content**: Alter, paraphrase, or interpret NBCC published content beyond honest extraction.

8. **Fake Credentials or Endorsement**: Claim affiliation with NBCC or misrepresent as an official service.

9. **Operate Outside Repository**: Deploy without repository source control, merge to main without review, or execute code not in the approved branch.

10. **Deploy Publicly**: Run on a public URL, domain, or cloud service without explicit human approval and compliance review.

## AI Model Behavior

Agents building or maintaining this application must not:

1. Fine-tune or train models on NBCC data.
2. Recommend changes that violate operating principles in AI_OPERATING_INSTRUCTIONS.md.
3. Approve their own work for release.
4. Ignore test failures or fabricate test results.
5. Commit code that bypasses security or privacy checks.

## Consequences

Violation of these prohibitions is grounds for immediate code review, rollback, and human investigation.

