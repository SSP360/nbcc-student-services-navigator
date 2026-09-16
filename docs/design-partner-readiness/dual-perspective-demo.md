# Dual Learner/Staff Handoff Demonstration

**Status**: Concept demonstrator. Static, documentation-based demonstration of what a
learner would see and what a staff member would need to receive, both derived from the
same real pipeline output shown in [`service-resolution-traces.md`](service-resolution-traces.md).
**This is not a live staff portal, not an integration, and not a case-management
record.** No student identity, personal case history, or live ticket is used or
simulated anywhere in this demonstration.

The example below uses **Trace 2** (`wellbeing_safety`, the corrected GQ-04 scenario)
because it is the highest-stakes case and therefore the most useful test of whether the
handoff between what a learner experiences and what a staff member would need is coherent
and complete.

---

## A. Learner Perspective

**What the learner would see** (demonstration UI concept — not implemented as a
student-facing feature; the `/dev/routing` inspector shows the equivalent data today in a
development-only form):

> **You asked**: "Is there support for sexual violence or assault on campus?"
>
> This question involves a sensitive personal safety matter. Rather than showing an
> automated answer, we're connecting you directly with **Wellness and Counselling**.
>
> 📞 Contact: [Wellness and Counselling](https://nbcc.ca/student-services/wellness-counselling)
>
> *This is a concept demonstration using public NBCC information. It is not an official
> NBCC service, not counselling, and not a crisis intervention service. If you are in
> immediate danger, contact emergency services or a crisis line directly — this
> demonstrator does not provide that path.*
>
> Source traceability: this routing decision was triggered by the words "assault"/
> "violence" in your question, per NBCC's escalation policy for sensitive personal
> information (`policies/ESCALATION_POLICY.md`, trigger 1).

**Required elements present**: approved source-backed result (the named service and its
real public URL), journey (`wellbeing_safety`, shown implicitly via the routed contact,
not exposed as jargon to the learner), a clear next step (contact Wellness and
Counselling), escalation and named contact, plain-language limitation, and source
traceability.

---

## B. Staff Perspective — Demonstration-Only Handoff Packet

> **⚠️ Demonstration-only handoff packet — not a live case-management record.**
> No student identity, personal case history, or live ticket exists. This illustrates
> what minimal, non-identifying context a handoff *could* carry if a future staff-assist
> pilot were separately approved and scoped — it is not a working feature today.

```json
{
  "packet_type": "demonstration_only_handoff",
  "disclaimer": "Not a live case-management record. No student identity or personal case history is attached.",
  "source_ids_consulted": ["NBCC-SS-005"],
  "journey": "wellbeing_safety",
  "escalation_trigger": "crisis_or_safety",
  "escalation_target_service_id": "NBCC-SS-005",
  "escalation_target_service_title": "Wellness and Counselling",
  "deterministic_reason": "Query text matched a sensitive/safety term ('assault'). Per ESCALATION_POLICY.md trigger 1 (Sensitive Personal Information), this must escalate to human support rather than receive an automated answer.",
  "relevant_policy_reference": "policies/ESCALATION_POLICY.md, trigger 1 (Sensitive Personal Information); Contact Routes table (Mental health/wellness -> Wellness and Counselling)",
  "safety_and_limitations_note": "This packet is generated from a keyword match against demonstration query text only. It has not been reviewed by a counsellor, does not represent a clinical assessment, and must not be treated as a substitute for a real intake or triage process. In a real pilot, any staff-facing handoff would require its own privacy, security, and governance review before any real query content is transmitted."
}
```

**What this packet deliberately excludes** (by design, not oversight): student name,
student ID, email, IP address, session identifier, free-text of the original query beyond
the single matched keyword already disclosed above, timestamp tied to an individual,
device or location data, and any case number or ticket reference. There is no schema
field for any of these, and none is planned to be added without a separate, explicit
scope decision (see [`pilot-charter.md`](pilot-charter.md), privacy/security gate).

---

## Why This Trace Was Chosen

The safety/crisis case is the one where a broken or incoherent handoff would matter most.
Demonstrating it end-to-end — showing that both the learner-facing message and the
staff-facing packet trace back to the exact same deterministic decision
(`crisis_or_safety` → `NBCC-SS-005`), with no divergence between what the learner is told
and what a staff member would be shown — is stronger evidence than choosing an easier,
lower-stakes journey.

## Reproducibility

Both perspectives above are derived from the real API response documented in Trace 2 of
`service-resolution-traces.md`. Run `GET /api/dev/routing?q=Is%20there%20support%20for%20sexual%20violence%20or%20assault%20on%20campus`
against a locally running dev server to see the same underlying data.
