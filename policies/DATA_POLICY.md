# Data Policy

## Guiding Principle

The NBCC Student Services Navigator collects **no student personal data**.

The application is a read-only, stateless information service. It does not store, process, or transmit any personally identifiable information.

## Data Handling Rules

### What the Application Receives

- Student questions typed into the question field (free text).
- HTTP headers and request metadata (IP address, user-agent).

### What Happens to Student Questions

- **Day 1**: Not stored, not processed, not transmitted. Input field is a placeholder only.
- **Day 2+**: If AI model integration is approved, questions will be transmitted *only* to the approved LLM provider under a separate privacy agreement. No questions are stored in the application.

### What Happens to Request Metadata

- Server logs may record IP address and user-agent for debugging only.
- Logs are deleted after 24 hours.
- Logs are never shared with third parties.
- Logs are never used for analytics or tracking.

### What the Application Displays

- NBCC public information from approved sources in `knowledge/sources.yaml`.
- All displayed content originates from public NBCC web pages or published documents.
- No inferred, generated, or augmented content is displayed.

## Credentials and Secrets

- No credentials, API keys, tokens, or passwords are stored in the application code.
- No credentials are committed to the repository.
- `.gitignore` explicitly excludes `.env*` files.
- All secrets are managed via environment variables in local development only.

## Third-Party Integrations

- **Day 1**: No third-party integrations.
- **Future integrations** (Day 2+): Must require explicit human approval and a separate privacy assessment.
- **Never permitted**: Student data shared with analytics services, advertising networks, or SIMS without explicit consent and legal agreement.

## User Notifications

The application displays a prominent disclaimer:

> "Lucentrix concept demonstration using public NBCC information.
> Not an official NBCC service. Do not enter personal or confidential information."

## Compliance

- This policy complies with the PIPEDA (Personal Information Protection and Electronic Documents Act) principle of minimization: only the data necessary for the service is collected, and none is stored.
- No student data is shared with NBCC without explicit student action (e.g., calling a phone number displayed by the application).

## Audit

Data handling is auditable through:
- Server logs (temporary, deleted after 24 hours).
- Code review (no data storage in codebase).
- Absence of databases, file storage, or cloud integration.

## Questions

For questions about this policy, see ESCALATION_POLICY.md and contact NBCC directly using routes in `knowledge/sources.yaml`.

