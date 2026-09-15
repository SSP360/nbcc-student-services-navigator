# Product Scope

## Day 1 Scope (Required for Launch)

### Features

1. **Home Page**
   - Product name visible: "NBCC Student Services Navigator"
   - Non-production disclaimer prominently displayed
   - Question input field (placeholder; no processing on Day 1)
   - Attribution to approved sources

2. **Information Display**
   - Retrieve and display one approved NBCC public source (NBCC-SS-001)
   - Show source metadata: ID, title, original URL, retrieval timestamp
   - Display extracted readable text from the source
   - Indicate whether content is live-fetched or snapshot-based

3. **Developer Tools**
   - `/dev/sources` endpoint (development environment only)
   - Display all sources in catalogue with metadata
   - Available only when NODE_ENV === "development"
   - Returns 404 in production

4. **Health Check**
   - `GET /api/health` endpoint
   - Returns JSON: status, service name, version, timestamp
   - Confirms application is running and responsive

5. **Source Catalogue**
   - Load `knowledge/sources.yaml` at startup
   - Validate all sources match schema
   - Enforce HTTPS URLs, approved domains, valid authority/review status
   - Confirm NBCC-SS-001 is accessible and retrievable

6. **Testing**
   - Unit tests for source catalogue validation
   - Integration test for health-check endpoint
   - Integration test for NBCC-SS-001 retrieval
   - Manual acceptance tests documented in learning log

### What's NOT in Day 1

- LLM integration or AI-generated answers
- Embeddings or vector database
- Semantic search or keyword matching
- French language support
- Authentication or student login
- Conversation history storage
- Case management or ticketing
- Analytics or usage tracking
- Public deployment
- Real-time content extraction from all sources (only NBCC-SS-001)

## Day 2+ Scope (Deferred)

- LLM integration for question answering
- Vector embeddings and semantic search
- French language generation
- Extraction of clean text from remaining sources
- Golden questions evaluation
- Sensitivity test cases
- Case management system
- Analytics dashboard
- Escalation tracking and follow-up
- Public deployment (with legal review)
- SIMS/Brightspace integration (if approved)

## Scope Boundaries

- **In scope**: Displaying public NBCC information, directing to human support.
- **Out of scope**: Making student-specific decisions, storing personal data, autonomous account access.

## Scope Amendment Process

To expand this scope:
1. Amendment must be requested in writing.
2. Amendment must be approved by authorized human.
3. Charter must be updated.
4. New acceptance criteria must be documented.
5. Tests must be added before implementation.

