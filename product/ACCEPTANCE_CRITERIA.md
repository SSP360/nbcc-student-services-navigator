# Day 1 Acceptance Criteria

## AC-01: Application Runs Locally

**Given** a developer runs `npm install && npm run dev`  
**When** the command completes  
**Then** the application starts on localhost:3000 without errors

**Test**: Manual — start dev server, verify 200 response on http://localhost:3000

---

## AC-02: Product Name and Disclaimer Displayed

**Given** a student visits http://localhost:3000  
**When** the page loads  
**Then**:
- Page title includes "NBCC Student Services Navigator"
- Non-production disclaimer banner is visible at top of page
- Disclaimer text includes: "Lucentrix concept demonstration using public NBCC information"
- Disclaimer text includes: "Not an official NBCC service"
- Disclaimer text includes: "Do not enter personal or confidential information"
- Disclaimer is styled to be prominent and not dismissible

**Test**: Manual — load home page, verify disclaimer text and styling

---

## AC-03: Question Input Field Placeholder

**Given** a student visits the home page  
**When** the page loads  
**Then**:
- A text input field is present and focusable
- Placeholder text is visible (e.g., "Ask about NBCC services...")
- Student can type text into the field
- Input is NOT processed, stored, or transmitted on Day 1
- No error messages appear when typing

**Test**: Manual — type into field, verify no processing or storage

---

## AC-04: Health-Check Endpoint

**Given** a developer runs the application  
**When** they request `GET /api/health`  
**Then**:
- Endpoint returns HTTP 200
- Response body is valid JSON
- Response includes: `status: "ok"`
- Response includes: `service: "nbcc-student-services-navigator"`
- Response includes: `version` (package version)
- Response includes: `timestamp` (ISO-8601 format)

**Test**: Automated — Jest test for health endpoint response format and status code

---

## AC-05: Source Catalogue Loads

**Given** the application starts  
**When** source catalogue initialization completes  
**Then**:
- `knowledge/sources.yaml` is read without error
- All sources are parsed and validated
- At least one source exists
- Source IDs are unique
- All sources have required fields: id, title, url, domain, campuses, languages, source_type, authority, review_status, retrieved_at, time_sensitive
- All URLs use HTTPS protocol
- All domains are from NBCC allowlist
- All authority values are in: [nbcc_public]
- All review_status values are in: [prototype_public_source]
- NBCC-SS-001 exists in catalogue

**Test**: Automated — Jest test for source schema validation and NBCC-SS-001 presence

---

## AC-06: NBCC-SS-001 Retrieval

**Given** the application starts  
**When** NBCC-SS-001 is requested  
**Then**:
- Source metadata is displayed: ID, title, URL, retrieval timestamp, retrieval method
- Retrieval status is shown (success or error)
- If successful: extracted readable text from the source is displayed
- If failed: error message is displayed; no fabricated content shown
- Content is labeled as "Live-fetched" or "Snapshot-based"
- If content blocks retrieval, a public snapshot is saved to `knowledge/raw/NBCC-SS-001.html` with date label

**Test**: Automated — Jest test for retrieval success/error handling; Manual — verify displayed content matches source

---

## AC-07: Developer Source Inspector

**Given** the application runs in development (NODE_ENV=development)  
**When** a developer visits `/dev/sources`  
**Then**:
- Page displays all sources in the catalogue
- Each source shows: ID, title, URL, domain, authority, review_status
- Page is accessible and renders without error

**Given** the application runs in production (NODE_ENV=production)  
**When** anyone visits `/dev/sources`  
**Then**:
- Endpoint returns HTTP 404
- No source data is exposed

**Test**: Automated — Jest test for NODE_ENV check and 404 in production; Manual — verify dev view displays all sources

---

## AC-08: Tests Pass

**Given** a developer runs `npm test`  
**When** test suite completes  
**Then**:
- All tests pass (0 failures)
- Source catalogue validation tests pass
- Health-check endpoint tests pass
- NBCC-SS-001 retrieval test passes
- No critical warnings or errors in test output

**Test**: Automated — Jest test runner

---

## AC-09: README Local Setup Instructions

**Given** a developer reads README.md  
**When** they follow the setup steps  
**Then**:
- Steps are clear and complete
- Steps include: node version check, npm install, npm run dev
- Steps are tested and work locally
- Output matches expected behavior

**Test**: Manual — follow README steps exactly, verify application starts

---

## AC-10: Learning Log Documented

**Given** Day 1 implementation completes  
**When** learning-log/DAY_01.md is reviewed  
**Then**:
- Document records decisions made (tech stack, port, branch strategy)
- Document records what was built (features, endpoints, tests)
- Document records test results (all pass)
- Document records NBCC-SS-001 retrieval result (live or snapshot)
- Document records problems encountered (if any)
- Document records known limitations
- Document records what should happen on Day 2

**Test**: Manual — review learning log for completeness and accuracy

---

## AC-11: No Prohibited Behaviour

**Given** the Day 1 application is complete  
**When** it is reviewed for security and policy  
**Then**:
- No student personal data is stored or transmitted
- No LLM or AI model is integrated
- No authentication is required
- No analytics or tracking is enabled
- No external fonts, trackers, or third-party scripts are loaded
- No credentials are visible in code or logs
- `.gitignore` excludes `.env*` files
- No SIMS, Brightspace, or Microsoft integrations exist

**Test**: Code review against PROHIBITED_ACTIONS.md

---

## AC-12: Branch and Commit Hygiene

**Given** Day 1 development completes  
**When** the code is reviewed  
**Then**:
- All work is on branch `feat/day-01-foundation`
- Main branch is not modified
- All commits have descriptive messages
- All commits are signed (if org policy requires)
- No credentials or secrets are committed
- No merge to main, no push to remote, no PR opened until human approval

**Test**: `git log --oneline` and `git status` verification

