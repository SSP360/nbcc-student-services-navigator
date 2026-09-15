# Day 1 Decisions

## D1-001: Technology Stack

**Decision**: Next.js 14+ (current stable) with TypeScript, Jest for testing.

**Rationale**:
- Full-stack framework enables both frontend (question field) and backend (health check, source retrieval) in one codebase.
- Built-in API routes (`app/api/`) support `/api/health` and `/dev/sources` endpoints.
- Zero-config testing with Jest; fast feedback loop.
- Type safety reduces runtime errors.
- Active community and well-documented.

**Alternatives Considered**:
- Flask/Python: Lighter, but requires separate frontend build step.
- Express: More flexible, but requires more scaffolding.

**Decision Date**: 2026-09-15

---

## D1-002: Node.js Version

**Decision**: Use the current Node.js LTS version available on the developer's machine.

**Rationale**:
- LTS versions are stable and well-supported.
- Pin dependencies in `package.json` and `package-lock.json` to ensure reproducibility.
- Do not assume Node 18+ or 20+; detect and use what's available.

**Decision Date**: 2026-09-15

---

## D1-003: Server Port

**Decision**: Use localhost:3000 (Next.js default).

**Rationale**:
- Standard for Next.js development.
- Well-known, easy to remember.
- Reduces configuration friction.

**Alternatives Considered**:
- Port 8000 or 8080: Non-standard for Node.js; adds configuration.

**Decision Date**: 2026-09-15

---

## D1-004: Source Retrieval Strategy

**Decision**: Live-fetch NBCC-SS-001 from the internet on every request.

**Rationale**:
- Keeps content fresh and up-to-date.
- Demonstrates real source attribution.
- Keeps repository size small (no large HTML files).

**Fallback**: If NBCC website blocks or prevents retrieval, save a public snapshot to `knowledge/raw/NBCC-SS-001.html` with a date label.

**Decision Date**: 2026-09-15

---

## D1-005: Developer Source View

**Decision**: Implement `/dev/sources` endpoint that is accessible only when `NODE_ENV=development`.

**Rationale**:
- Allows developers to inspect the source catalogue without exposing it to users in production.
- Returns 404 outside development.
- Does not use `NEXT_PUBLIC_*` environment variables (those are exposed to browser in Next.js).

**Implementation**: Check `process.env.NODE_ENV` in API route; return 404 if not "development".

**Decision Date**: 2026-09-15

---

## D1-006: Question Field Behavior

**Decision**: Question field is a UI placeholder only on Day 1. No processing, storage, or transmission.

**Rationale**:
- Demonstrates the intended UX without requiring LLM integration.
- Complies with DATA_POLICY.md (no student data collected).
- Reduces scope for Day 1; allows incremental feature addition.

**Change on Day 2+**: With LLM integration approval, questions will be transmitted to the approved provider.

**Decision Date**: 2026-09-15

---

## D1-007: Test Framework

**Decision**: Jest with React Testing Library for component tests and API route tests.

**Rationale**:
- Built-in with Next.js; zero-config.
- Fast test execution.
- Excellent snapshot and assertion library.
- Lightweight; no external CI/CD required for Day 1.

**Decision Date**: 2026-09-15

---

## D1-008: Test Directory

**Decision**: All tests in `tests/` directory at repository root.

**Rationale**:
- Clear separation of source code and tests.
- Convention used by many Node.js projects.
- Simplifies .gitignore and test discovery.

**Decision Date**: 2026-09-15

---

## D1-009: Source Snapshot Storage

**Decision**: If live fetch fails, save snapshot to `knowledge/raw/NBCC-SS-001.html` with ISO-8601 date in filename or header.

**Rationale**:
- Maintains demonstrator functionality if NBCC website is unavailable.
- Public snapshot (no authentication required to save).
- Clearly labeled as snapshot, not live content.

**Future**: Day 2+ may automate snapshot refresh.

**Decision Date**: 2026-09-15

---

## D1-010: No Favicon on Day 1

**Decision**: Do not create or add favicon on Day 1.

**Rationale**:
- Out of scope; not required for core functionality.
- Reduces file creation overhead.
- Can be added on Day 2 if brand/UI guidelines are finalized.

**Decision Date**: 2026-09-15

---

## D1-011: Filename Correction

**Decision**: Rename `AI_OPERATING_INSTRUCTIONS.md,` to `AI_OPERATING_INSTRUCTIONS.md` using `git mv`.

**Rationale**:
- Trailing comma is a syntax error in most tools and build systems.
- Proper filename enables imports, linting, and automation.
- Git tracks the change as a rename, preserving history.

**Decision Date**: 2026-09-15

---

## D1-012: Branch Strategy

**Decision**: All Day 1 work on branch `feat/day-01-foundation`. Main branch unchanged.

**Rationale**:
- Isolates Day 1 changes for review.
- Allows parallel work if needed.
- Enables easy rollback if issues are found.
- Follows gitflow convention for feature branches.

**Decision Date**: 2026-09-15

---

## Future Decisions (Deferred to Day 2+)

- LLM provider selection (OpenAI, Anthropic, etc.)
- Embedding model for semantic search
- Database for conversation history (if approved)
- Deployment target (cloud provider, on-premises)
- Internationalization (French language support)
- SIMS/Brightspace integration (requires legal approval)

