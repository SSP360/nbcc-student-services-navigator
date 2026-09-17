# Accessibility Baseline (P0.3)

**Status**: Concept demonstrator. WCAG 2.2 AA-oriented baseline for the resolution-first
navigator (`app/page.tsx`, `app/api/resolve/route.ts`). This is a baseline, not a
certification — see `docs/MANUAL_TEST_SCRIPT.md` for the manual verification steps a human
tester should run before any real demonstration, and the "Tooling limitation" note below
for what automated verification could and could not confirm.

## A-01: Keyboard operability

Every interactive control in `app/page.tsx` — the urgent-help button, all six category
cards, the free-text input, the submit button, every guided-choice option, and the
recovery button — is a real semantic `<button>`, `<input>`, or `<a>` element, never a
`<div>` or `<span>` with a click handler. This is verified directly in
`tests/resolution-accessibility.test.tsx` ("every interactive control is a real
button/input/link"). Native `<button>` elements are keyboard-activatable by Enter and
Space by browser specification — no custom keydown handling was added that could
interfere with or override that native behaviour.

**Tooling limitation, disclosed rather than hidden**: this session's browser-automation
tool could move keyboard focus (Tab) and visibly showed the focus ring landing on each
control in order, but its synthetic Enter/Space key dispatch did not trigger the browser's
native button-activation default action in this environment — confirmed by checking
`document.activeElement` (correctly the focused button) and the network log (no request
fired) after dispatching Enter and Space. This reproduced consistently and is a known class
of limitation for CDP-driven synthetic key events, not a defect found in the application:
`fireEvent.click()`-based component tests (which exercise the same `onClick` handlers)
pass, and mouse-driven manual clicks in the same browser session worked correctly for
every scenario tested. **A human tester must still manually confirm real keyboard Enter/
Space activation** using `docs/MANUAL_TEST_SCRIPT.md` before this is treated as fully
verified — this baseline documents strong structural evidence (semantic elements, correct
focus order), not a substitute for that manual check.

## A-02: Visible focus

No custom `outline: none` is applied to any interactive element. `app/globals.css` adds an
explicit, high-contrast focus style (`3px solid #0056b3` with a 2px offset) via
`:focus-visible` on every `a`, `button`, and `input` — visually confirmed in this session's
browser verification (screenshot: a clear blue ring around "Academic support" after two Tab
presses from the urgent-help button).

## A-03: Programmatic labels and instructions

The free-text input has an explicit `<label htmlFor="question">` with the instructional
text "Or describe what you need in your own words (optional)" — reachable via
`getByLabelText` in `tests/resolution-accessibility.test.tsx`. Every button's visible text
is also its accessible name (no icon-only controls, no `aria-label` needed to compensate
for missing visible text).

## A-04: State changes are announced

The result region (`<div aria-live="polite">`) wraps every state (empty/loading/error/
result), so assistive technology announces new content as it appears. A `safety_escalation`
result's danger notice additionally uses `role="alert"` (assertive by default per the ARIA
spec) — the single most urgent case gets the strongest announcement, tested directly in
`tests/resolution-accessibility.test.tsx`.

## A-05: Logical focus management

**Fixed in P0.3** (a real, scoped accessibility fix, not just documentation): before this
change, focus stayed wherever the learner clicked after a category selection or free-text
submission, with no indication — visual or programmatic — that new content had appeared
below. `app/page.tsx` now moves focus to the result region (`tabIndex={-1}`, focused via a
`useEffect` keyed on `status`) whenever a result or error appears, verified in
`tests/resolution-accessibility.test.tsx` ("the result region receives focus after a
category selection"). The region is not a normal tab stop (`tabIndex={-1}`, no visible
ring on programmatic focus — see the `[tabindex='-1']:focus { outline: none }` rule) since
its purpose is orientation, not keyboard navigation.

## A-06: No colour-only state communication

Each result state has its own text heading (`STATE_HEADINGS` in `app/page.tsx`: "Recommended
service", "A few options that might fit", "Connecting you with a person", "We couldn't find
a specific match", "Urgent support") in addition to a border-colour accent
(`.result-card--<state>` in `app/globals.css`). The colour is decorative reinforcement, not
the only signal — verified in `tests/resolution-accessibility.test.tsx`.

## A-07: Responsive / mobile / reflow

`.category-grid` uses `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`,
collapsing to a single column under 768px (see the `@media (max-width: 768px)` block).
Verified visually in this session at a 375×812 mobile viewport: the urgent-help button, all
six category cards (stacked), and the free-text form all render without horizontal
scrolling or clipped text.

## A-08: Plain-language labels

Category labels use plain, student-facing language, not office names: "Money, fees, and
financial aid" (not "Financial Aid Office"), "Accommodations and accessibility" (not
"Accessibility and Inclusion Services Department"). Verified in
`tests/resolution-accessibility.test.tsx`.

## A-09: Persistent, visible urgent help

The urgent-help button (`.urgent-help-button`) is rendered unconditionally at the top of
`app/page.tsx`, above the category grid and the free-text form — visible and clickable
without typing or submitting anything. Verified both in
`tests/resolution-page.test.tsx` ("the urgent-help route is visible and usable without any
search submission") and live in the browser (F-16 manual verification in
`docs/P0_SPRINT_EXECUTION_PLAN.md`'s companion session notes).

## A-10: Understandable no-match / error recovery

An `unsupported_query` result states plainly that "We don't have a specific match for this
request. We can't guess, so here is how to reach General Student Services" — it does not
say something opaque like "No results" or fabricate an answer. An `error` state (a failed
fetch) says "Something went wrong: {message}" and offers a retry plus a direct NBCC contact
link, never a blank or silent failure.

## Minimum touch target size

Every button (`category-card`, `guided-option-button`, `recovery-button`,
`urgent-help-button`, `submit-button`) has `min-height: 44px` or padding that exceeds it —
the commonly-cited minimum touch-target guidance — set in `app/globals.css`.

## Automated checks run

No new dependency was added for automated accessibility auditing (e.g. no `axe-core`) —
proportionate to the existing test setup, which uses `@testing-library/react` and
`@testing-library/jest-dom` (already devDependencies) rather than a dedicated a11y linter.
`tests/resolution-accessibility.test.tsx` covers A-01, A-03, A-04, A-05, A-06, and A-08 with
automated, repeatable assertions. A-02, A-07, and A-09 were verified by direct browser
observation in this session (screenshots retained in the session transcript, not
committed to the repository). A-10 is verified by reading the exact rendered message text
in `tests/resolution-page.test.tsx`.
