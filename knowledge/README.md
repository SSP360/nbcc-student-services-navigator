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

## Deferred

- Curated content extraction (Day 2+)
- Conflict resolution between sources (Day 2+)
- Multi-language support (Day 2+)
