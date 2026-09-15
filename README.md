# NBCC Student Services Navigator

Concept demonstrator: Help NBCC students find accurate student services information and reach appropriate human support.

## Overview

**Status**: Day 1 Foundation (Pre-release, Development Only)

This is a non-production, public-source concept demonstrator. It does not store personal data and is not an official NBCC service.

**Disclaimer**: Lucentrix concept demonstration using public NBCC information. Not an official NBCC service. Do not enter personal or confidential information.

## Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SSP360/nbcc-student-services-navigator.git
cd nbcc-student-services-navigator

# 2. Install dependencies
npm install

# 3. Verify Node.js and npm versions
node --version  # Should be v20.0.0 or higher
npm --version
```

### Development

```bash
# Start the development server
npm run dev

# The application will be available at: http://localhost:3000
# Dev tools available at: http://localhost:3000/dev/sources
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test --watch

# View test coverage
npm test -- --coverage
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

**Note**: Public deployment requires explicit human approval. See DATA_POLICY.md.

## Architecture

- **Framework**: Next.js 15+ with TypeScript
- **Backend**: Next.js API routes
- **Frontend**: React 19+
- **Testing**: Jest + React Testing Library
- **Source Data**: YAML catalogue (`knowledge/sources.yaml`)

## Directory Structure

```
.
├── README.md (this file)
├── AI_OPERATING_INSTRUCTIONS.md (operating principles)
├── package.json (dependencies and scripts)
├── tsconfig.json (TypeScript configuration)
├── jest.config.js (test runner configuration)
├── next.config.js (Next.js configuration)
├── .gitignore (version control exclusions)
│
├── app/
│   ├── layout.tsx (root layout with disclaimer)
│   ├── page.tsx (home page with question field)
│   ├── globals.css (global styles)
│   ├── api/
│   │   ├── health/route.ts (health-check endpoint)
│   │   ├── source/[id]/route.ts (source retrieval endpoint)
│   │   └── dev/sources/route.ts (developer view API)
│   └── dev/
│       └── sources/page.tsx (developer source inspector)
│
├── lib/
│   ├── types.ts (TypeScript interfaces)
│   └── sources.ts (source catalogue loader)
│
├── tests/
│   ├── sources.test.ts (source validation tests)
│   ├── health-check.test.ts (health endpoint tests)
│   └── api/ (additional API tests)
│
├── product/
│   ├── PRODUCT_CHARTER.md (mission and vision)
│   ├── SCOPE.md (Day 1 features and boundaries)
│   ├── ACCEPTANCE_CRITERIA.md (testable requirements)
│   ├── DECISIONS.md (tech stack decisions)
│   └── BACKLOG.md (work items)
│
├── knowledge/
│   ├── sources.yaml (approved public NBCC sources)
│   ├── README.md (source quality standards)
│   └── raw/ (source snapshots, if live fetch fails)
│
├── policies/
│   ├── ANSWER_POLICY.md (how answers are generated)
│   ├── ESCALATION_POLICY.md (when to route to human support)
│   ├── PROHIBITED_ACTIONS.md (what the app must never do)
│   └── DATA_POLICY.md (data handling and privacy)
│
├── architecture/
│   ├── FUNCTIONAL_ARCHITECTURE.md (system design)
│   └── DECISION_LOG.md (architectural decisions)
│
└── learning-log/
    └── DAY_01.md (Day 1 decisions and learnings)
```

## Key Features (Day 1)

- ✅ Application runs locally on localhost:3000
- ✅ Prominent non-production disclaimer
- ✅ Question input field (placeholder, no processing yet)
- ✅ Retrieves and displays one approved NBCC public source (NBCC-SS-001)
- ✅ Health-check endpoint (`GET /api/health`)
- ✅ Developer source inspector (`/dev/sources`, development only)
- ✅ Automated tests for source catalogue and health check
- ✅ Clear local setup instructions

## Endpoints

### Public Endpoints

- `GET /` — Home page with question field and NBCC-SS-001 display
- `GET /api/health` — Health-check endpoint (returns JSON with status, service, version, timestamp)
- `GET /api/source/:id` — Retrieve content for a specific source

### Development-Only Endpoints

- `GET /dev/sources` — List all sources in the catalogue (403 in production)
- `GET /api/dev/sources` — API endpoint for source inspector

## Data & Privacy

This application:
- ✅ Does NOT store student personal information
- ✅ Does NOT process questions on Day 1
- ✅ Does NOT transmit user input to external services
- ✅ Uses ONLY approved public NBCC sources
- ✅ Requires no authentication

See policies/DATA_POLICY.md for complete privacy information.

## What's NOT Included (Day 1)

- ❌ Language model integration or AI-generated answers
- ❌ Embeddings or vector database
- ❌ Semantic search
- ❌ Student authentication or profiles
- ❌ SIMS or Brightspace integration
- ❌ Case management or ticketing
- ❌ Analytics or usage tracking
- ❌ Public deployment

See product/SCOPE.md for deferred features.

## Documentation

- **Operating Principles**: [AI_OPERATING_INSTRUCTIONS.md](AI_OPERATING_INSTRUCTIONS.md)
- **Product Mission**: [product/PRODUCT_CHARTER.md](product/PRODUCT_CHARTER.md)
- **Day 1 Scope**: [product/SCOPE.md](product/SCOPE.md)
- **Acceptance Criteria**: [product/ACCEPTANCE_CRITERIA.md](product/ACCEPTANCE_CRITERIA.md)
- **Tech Stack Decisions**: [product/DECISIONS.md](product/DECISIONS.md)
- **Policies**: [policies/README.md](policies)
- **Source Catalogue**: [knowledge/sources.yaml](knowledge/sources.yaml)
- **Day 1 Learnings**: [learning-log/DAY_01.md](learning-log/DAY_01.md)

## Support

For questions about student services, contact NBCC directly:
- **Web**: https://nbcc.ca/contact-us
- **Phone**: See NBCC contact page

This is a **concept demonstrator**, not a substitute for official NBCC services.

## License & Attribution

This is a Lucentrix concept demonstrator. All source material is public NBCC information.

---

**Development Status**: Day 1 Foundation Complete
**Last Updated**: 2026-09-15
**Branch**: feat/day-01-foundation
