# Student Validation Protocol (P0.3)

**Status**: Concept demonstrator. This is a facilitation guide for a hypothetical-scenario
usability session — it has not been run with real students. Running it is a future,
owner-approved activity (see `docs/P0_DECISIONS_REQUIRING_OWNER.md` if scheduling one is a
genuine open decision), not something this sprint claims to have completed.

## Purpose

Confirm that a real student, given a realistic (but hypothetical) situation, can reach the
correct service or an honest "we can't help with this automatically" outcome using the
navigator — without the facilitator explaining how the tool works first.

## Non-negotiable privacy rules for facilitators

- **Never ask about a participant's real, current situation.** Every task is a hypothetical
  scenario read aloud or handed to the participant on a card — "Imagine you..." — never
  "tell us about a time you...".
- **Do not record, transcribe, or retain anything the participant types into the tool.**
  The tool itself does not store input (see `app/api/resolve/route.ts`'s "no query text...
  is logged, stored, or persisted" comment) — the facilitator's own observation notes must
  hold to the same standard.
- **The observation sheet records what happened, not what was said.** Note "reached
  Financial Support in 1 step" or "expressed confusion at the guided-choice screen" — never
  transcribe the participant's typed query text or spoken words verbatim if they might
  contain personal information.
- If a participant volunteers a real personal situation unprompted, redirect: "For this
  session let's stick to the hypothetical scenario on the card" — and do not record what
  they said.
- Participation is voluntary, anonymous (no name recorded on the observation sheet — use a
  participant number), and can stop at any time with no consequence.

## Scenario set (V-02)

Each scenario is a card the participant reads or hears; the facilitator does not say which
button/journey is "correct."

| # | Scenario (hypothetical) | Intended service | Notes for facilitator |
|---|---|---|---|
| 1 | "You want to find someone who can help you plan your course load and stay on track this semester." | Academic support | Do not say the word "academic" — test whether the participant finds the right category unprompted. |
| 2 | "You're worried about affording your tuition fees this term and want to know what help exists." | Financial support | Watch whether they try free text or a category card first. |
| 3 | "You think you might need extra time on tests because of a learning difference, and you're not sure who to ask." | Accessibility | This is the F-09/F-10-style phrasing — confirm it resolves cleanly. |
| 4 | "You need to replace a lost student ID card." | **Unsupported** — no approved source exists for this today. | The correct outcome is an honest "we can't help with this specific thing" plus a General Student Services route — not a wrong confident guess. Success = participant reaches General Student Services and understands why. |
| 5 | "Your Wi-Fi hasn't been working in your dorm for two days." | **Unsupported** — no approved source exists for this today. | Same success criterion as #4. |
| 6 | "You or a friend just experienced something that felt unsafe on campus and you want to know who to contact right now." | Safety escalation | **Facilitator must pre-brief this scenario carefully** — see the safety note below. |
| 7 | "You're not sure what kind of help you even need right now, you just know something feels off." | Guided choice / uncertain need | Tests F-06/F-14-style uncertain framing. |

### Safety-scenario handling (Scenario 6)

Before running Scenario 6, tell the participant explicitly: "This next scenario is about a
hypothetical safety situation — you are not being asked to share anything real. If this
scenario is uncomfortable for you, we can skip it." Never require a participant to engage
with the safety scenario. If skipped, note "Scenario 6: skipped by participant choice" —
never press for a reason.

## Facilitator guide

1. Read the consent/privacy script aloud (see below) before starting.
2. Hand the participant one scenario card at a time, in any order except that Scenario 6
   (safety) is offered last and is always optional.
3. Ask the participant to think aloud as they use the tool.
4. Do not intervene unless the participant is stuck for more than ~60 seconds or asks a
   direct question — if so, note it as a barrier rather than silently helping.
5. After each scenario, ask: "What do you think would happen next if this were real?" —
   this checks comprehension of the result (did they understand it was routing them to a
   person vs. giving them information vs. saying it couldn't help).
6. Complete the observation sheet immediately after each scenario, while it's fresh.

### Consent/privacy script (read aloud)

> "Thanks for helping test this. Everything in this session is hypothetical — please don't
> share anything about your real personal situation. Nothing you type into the tool is
> saved anywhere. I'll be taking notes on what happens on screen, not on what you say, and
> your name won't be recorded. You can stop at any point. Any questions before we start?"

## Observation sheet (V-04)

One row per scenario per participant. Participant identified by number only.

| Field | What to record |
|---|---|
| Participant # | e.g. P3 |
| Scenario # | 1–7 |
| Correct service reached? | Yes / No / Partially (e.g. reached guided choice but picked wrong option) |
| Steps to meaningful action | Count of clicks/submissions until a result with a clear next step appeared |
| Time to meaningful action | Approximate seconds |
| Used recovery ("not the right service")? | Yes / No |
| Comprehension check response | Brief paraphrase of what they said would happen next (no verbatim personal content) |
| Barriers observed | e.g. "didn't notice the free-text option", "unsure what 'guided choice' options meant" |
| Facilitator intervened? | Yes / No + reason |

## Severity rubric and release recommendation (V-05)

After all sessions, classify each finding:

| Severity | Definition | Example |
|---|---|---|
| **Critical** | A participant reached a wrong confident route for a safety-relevant or clearly out-of-scope request, or could not find the urgent-help route when looking for it. | Scenario 4/5 resolved to a confident but wrong service; Scenario 6 route was not found. |
| **Major** | A participant needed facilitator intervention to reach the correct outcome, or repeatedly misunderstood a result's meaning. | Participant did not understand a `guided_choice` screen's options. |
| **Minor** | A participant reached the correct outcome but expressed confusion, hesitation, or took an indirect path. | Tried free text before noticing the category cards. |
| **Cosmetic** | Wording or layout preference with no effect on task success. | "I'd word this differently" with no comprehension issue. |

**Release recommendation template** (fill in after a real session — this sprint has not run
one, so this template is included but not completed):

```
Session date: ____
Participants: ____ (anonymous count only)
Scenarios run: ____ of 7
Critical findings: ____ (must be zero before any owner demonstration)
Major findings: ____ (each needs an owner decision: fix before demo, or accept and disclose)
Minor/Cosmetic findings: ____ (backlog, non-blocking)
Recommendation: [Ready to demonstrate / Needs fixes first / Needs another round]
```

## What this protocol explicitly does not do

- It does not collect any real student's real case, question, or personal situation.
- It does not use the navigator's own free-text field to capture anything for later
  analysis beyond the facilitator's own observation notes (which never quote the
  participant's real personal content).
- It does not run automatically as part of this sprint — running it with real participants
  is a future, owner-scheduled activity.
