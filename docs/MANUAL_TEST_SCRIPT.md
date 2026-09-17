# Manual Test Script (P0.3)

Run this script on a real device/browser (not automation) before any design-partner or
owner demonstration. Record PASS/FAIL and notes for each step. This complements, and does
not replace, the automated tests in `tests/resolution-*.test.ts(x)`.

## Setup

```
npm ci
npm run dev
# open http://localhost:3000
```

## 1. Keyboard-only pass (A-01, A-02, A-05)

1. Load the homepage. Do not touch the mouse for the rest of this section.
2. Press Tab repeatedly. Confirm a visible focus ring appears on: the urgent-help button,
   each of the 6 category cards in order, the free-text input, the submit button.
   **Expected**: every stop has a clearly visible outline; nothing is skipped; nothing
   traps focus (you can Tab past the last control).
3. With focus on "Academic support", press Enter. **Expected**: a result appears, and
   focus moves to the result area (you should be able to immediately press Tab and land on
   the first control inside the result, e.g. the source link or "This is not the right
   service").
4. Press Shift+Tab back to the category grid and use arrow-key-free Tab navigation to reach
   "Wellbeing and safety"; press Space (not Enter) to activate it. **Expected**: same
   activation behaviour as Enter.
5. From any result, Tab to "This is not the right service" and press Enter. **Expected**:
   the guided-choice category list appears; focus moves there.

## 2. Screen reader spot-check (A-04)

Using VoiceOver (Mac: Cmd+F5) or NVDA (Windows):

1. Navigate to the homepage. **Expected**: the page title and h1 "Student Services
   Navigator" are announced.
2. Activate "Money, fees, and financial aid". **Expected**: the screen reader announces new
   content appearing (the live region) without requiring the user to manually re-navigate
   to find it.
3. Trigger a safety scenario (type "I was sexually assaulted" and submit, or click "Need
   urgent help or feel unsafe?"). **Expected**: the danger notice is announced promptly and
   assertively (role="alert"), not silently or only on next navigation.

## 3. Mobile / reflow (A-07)

1. Open the homepage on a real phone, or resize a desktop browser to ~375px wide.
2. Confirm: no horizontal scrollbar; the urgent-help button and all category cards are
   fully visible without clipping; text does not overlap.
3. Zoom the browser to 200%. Confirm all text remains readable and controls remain usable
   (WCAG 1.4.10 reflow).

## 4. Colour-independence spot-check (A-06)

1. Enable a greyscale/colour-blindness simulation (e.g. macOS Accessibility > Display >
   Color Filters, or a browser extension).
2. Trigger one result of each state (confident_route, guided_choice, safety_escalation,
   unsupported_query). **Expected**: each state's heading text ("Recommended service",
   "A few options that might fit", "Urgent support", "We couldn't find a specific match")
   is legible and distinguishes the state without relying on the border colour.

## 5. Source-unavailability fallback (G-04/G-05, cross-reference)

1. Confirm from `docs/SOURCE_COVERAGE_MATRIX.md` that `NBCC-SS-003` is `needs_review`.
2. Confirm `academic_support` still resolves to a `confident_route` (NBCC-SS-002) — the
   `needs_review` source does not block the journey.

## 6. Safety escalation precedence (C-04)

1. Type a query that combines a safety term with other content, e.g. "I was assaulted and
   need help with fees." Submit.
   **Expected**: the result is `safety_escalation`, never `guided_choice` or a financial
   route — safety must win regardless of what else is in the query.

## 7. Recovery never dead-ends (F-18, C-05)

1. From any result state, click/activate "This is not the right service".
   **Expected**: you always reach a category list again — never a blank page, a broken
   link, or a state with no further action available.

## Record

| Step | Result (PASS/FAIL) | Notes |
|---|---|---|
| 1. Keyboard-only pass | | |
| 2. Screen reader spot-check | | |
| 3. Mobile / reflow | | |
| 4. Colour-independence | | |
| 5. Source-unavailability fallback | | |
| 6. Safety escalation precedence | | |
| 7. Recovery never dead-ends | | |

This session's automated equivalent of steps 1, 5, 6, and 7 passed (see
`tests/resolution-accessibility.test.tsx`, `tests/resolution-sources.test.ts`,
`tests/resolution-acceptance.test.ts`). Steps 2, 3, and 4 require a human tester with a
real screen reader / device and were not run as part of this automated sprint — this is
recorded as a known gap in the final Sprint Demonstration Pack, not silently assumed.
