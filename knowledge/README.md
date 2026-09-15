# Knowledge Base

This directory contains the source catalogue and extracted content for the NBCC Student Services Navigator.

## Sources

**sources.yaml** contains the authoritative catalogue of approved public NBCC information sources.

### Source Schema

Each source must include:
- `id`: Unique identifier (e.g., NBCC-SS-001)
- `title`: Human-readable title
- `url`: HTTPS URL to the source (https://nbcc.ca/* or https://documents.nbcc.ca/*)
- `domain`: Category (general_student_services, academic_support, etc.)
- `campuses`: List of applicable campuses (e.g., ["all"])
- `languages`: Languages available (e.g., ["en"])
- `source_type`: Type of source (webpage, document, pdf, etc.)
- `authority`: Must be "nbcc_public" for public sources
- `retrieved_at`: ISO-8601 date when the source was last reviewed
- `time_sensitive`: Boolean indicating if content has expiration risk
- `review_status`: Approval status (must be "prototype_public_source" for Day 1)

### Allowed Domains

Only sources from these domains are approved:
- `nbcc.ca`
- `documents.nbcc.ca`

### Adding a New Source

1. Verify the URL is publicly accessible and uses HTTPS.
2. Add an entry to `sources.yaml` with all required fields.
3. Set `authority: nbcc_public` and `review_status: prototype_public_source`.
4. Run source validation: `npm test`
5. Commit the change with a clear message.

### Source Quality Standards

- **Accuracy**: Content must match the official NBCC webpage.
- **Freshness**: Time-sensitive sources must be reviewed at least monthly.
- **Completeness**: Sources must include enough context for a student to understand the service.
- **No Personalization**: Avoid content that requires student-specific information (ID, email, etc.).

## Raw Content

**knowledge/raw/** contains snapshots of retrieved source content.

If live fetch fails, a snapshot is saved as:
```
knowledge/raw/SOURCE-ID.html
```

Snapshots are labeled with a retrieval date and indicate whether content is live or snapshot-based.

## Curated Content (Day 2, D2-01)

**knowledge/curated/** contains a controlled, machine-readable corpus of verified, readable
institutional content extracted from approved sources. This allows later deterministic
retrieval to search curated text rather than raw webpages.

### Curated File Format

One JSON file per source, named `SOURCE-ID.json` (e.g., `NBCC-SS-001.json`).

### Curated Record Schema

```json
{
  "source_id": "NBCC-SS-001",
  "title": "Student Services at NBCC",
  "url": "https://nbcc.ca/student-services",
  "domain": "general_student_services",
  "campuses": ["all"],
  "language": "en",
  "source_type": "webpage",
  "authority": "nbcc_public",
  "review_status": "prototype_public_source",
  "retrieval_timestamp": "2026-09-15T13:18:13.961Z",
  "retrieval_method": "live-fetch",
  "http_status": 200,
  "content_length": 3967,
  "extracted_text": "...",
  "retrieval_error": null
}
```

### Provenance

Every curated record's `source_id` and `url` must match an entry in `sources.yaml`. This
traceability is validated automatically (see `lib/curated-sources.ts` and
`tests/curated-sources.test.ts`).

### Curation Rules

- Only URLs already approved in `sources.yaml` and within the allowlisted domains may be curated.
- `extracted_text` must be readable, unaltered institutional content (no rewriting,
  summarization, or "improvement" of meaning). Only navigation, script, and style noise is
  removed during extraction.
- `extracted_text` must be at least 500 characters (the minimum usable-content threshold) or
  the record is invalid.
- If live fetch fails, `retrieval_method` must be `"snapshot"` and the record must reference a
  dated snapshot under `knowledge/raw/`. `retrieval_error` records the failure reason when
  retrieval fails without producing usable content.
- Curated content is a controlled internal knowledge foundation, not a student-facing
  capability.

### Validation

Run `npm test` to validate the curated corpus. Validation detects: missing required metadata,
duplicate source IDs, empty extracted text, invalid URLs, URLs outside the approved allowlist,
and content below the minimum usable-content threshold.

## Deferred

- Conflict resolution between sources (Day 2+)
- Multi-language support (Day 2+)
- Deterministic search over curated content (Day 2+)
