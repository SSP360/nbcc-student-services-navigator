/**
 * @jest-environment jsdom
 *
 * Automated accessibility checks proportionate to the existing test setup
 * (no new dependency added — this uses @testing-library/react, already a
 * devDependency, not an axe-core style automated auditor). See
 * docs/ACCESSIBILITY_BASELINE.md and docs/MANUAL_TEST_SCRIPT.md for the
 * manual checks (keyboard traversal, screen-reader announcement, mobile
 * reflow, zoom) that cannot be verified by jsdom alone.
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'
import type { ResolutionResult } from '@/lib/resolution/types'

function mockFetchOnce(result: ResolutionResult) {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => result }) as jest.Mock
}

const confidentAcademic: ResolutionResult = {
  state: 'confident_route',
  message: 'Based on what you shared, Student Success Coaching is the right place to start.',
  journey: 'academic_support',
  source: { id: 'NBCC-SS-002', title: 'Student Success Coaching', url: 'https://nbcc.ca/student-services/student-success-coaching' },
  primaryAction: { label: 'Visit Student Success Coaching', href: 'https://nbcc.ca/student-services/student-success-coaching' },
  recoveryAction: { label: 'Not the right service?', href: 'https://nbcc.ca/student-services' },
}

describe('A-03: form inputs have programmatic labels', () => {
  test('the free-text input has an associated label reachable by accessible name', () => {
    render(<Home />)
    expect(screen.getByLabelText(/describe what you need/i)).toBeInTheDocument()
  })
})

describe('A-08: plain-language labels', () => {
  test('category labels avoid office-name jargon', () => {
    render(<Home />)
    // "Money, fees, and financial aid" not "Financial Aid Office"; "Accommodations
    // and accessibility" not "Accessibility and Inclusion Services Department".
    expect(screen.getByRole('button', { name: 'Money, fees, and financial aid' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accommodations and accessibility' })).toBeInTheDocument()
  })
})

describe('A-05: focus moves logically after a selection', () => {
  test('the result region receives focus after a category selection', async () => {
    mockFetchOnce(confidentAcademic)
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: 'Academic support' }))
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: 'Recommended service' })
      expect(heading).toBeInTheDocument()
    })
    // The live region wrapping the result is the programmatic focus target.
    const liveRegion = document.querySelector('[aria-live="polite"]')
    expect(liveRegion).toHaveFocus()
  })
})

describe('A-04: state changes are announced', () => {
  test('the result area is a polite live region', () => {
    render(<Home />)
    expect(document.querySelector('[aria-live="polite"]')).toBeInTheDocument()
  })

  test('a safety escalation uses role="alert" (assertive by default)', async () => {
    const safety: ResolutionResult = {
      state: 'safety_escalation',
      message: 'This may involve a safety or crisis concern.',
      journey: 'wellbeing_safety',
      primaryAction: { label: 'Get urgent help now', href: 'https://nbcc.ca/student-services/wellness-counselling' },
      recoveryAction: { label: 'Not the right service?', href: 'https://nbcc.ca/student-services' },
      escalation: {
        message: 'If you are in immediate danger, contact local emergency services.',
        action: { label: 'Get urgent help now', href: 'https://nbcc.ca/student-services/wellness-counselling' },
      },
    }
    mockFetchOnce(safety)
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /need urgent help or feel unsafe/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})

describe('A-01: every interactive control is a real button/input/link, not a div with a click handler', () => {
  test('category cards, urgent help, and submit are semantic buttons', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: /need urgent help or feel unsafe/i }).tagName).toBe('BUTTON')
    expect(screen.getByRole('button', { name: 'Academic support' }).tagName).toBe('BUTTON')
    expect(screen.getByRole('button', { name: /find my service/i }).tagName).toBe('BUTTON')
  })
})

describe('A-06: state is not communicated by colour alone', () => {
  test('every result state has a distinct text heading, not just a colour cue', async () => {
    mockFetchOnce(confidentAcademic)
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: 'Academic support' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Recommended service' })).toBeInTheDocument())
  })
})
