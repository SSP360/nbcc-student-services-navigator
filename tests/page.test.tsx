/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'
import type { NavigateResult } from '@/lib/navigate'

function mockFetchOnce(result: NavigateResult, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => result,
  }) as jest.Mock
}

const wellbeingResult: NavigateResult = {
  query: 'Is there support for sexual violence or assault on campus?',
  journey: 'wellbeing_safety',
  hasSource: true,
  source: { id: 'NBCC-SS-005', title: 'Wellness and Counselling', url: 'https://nbcc.ca/student-services/wellness-counselling' },
  why: 'Your question matched "Wellness and Counselling", one of NBCC\'s approved Student Services pages.',
  whatToDoNext: 'Contact Wellness and Counselling directly using the details below.',
  escalation: {
    should_escalate: true,
    trigger: 'crisis_or_safety',
    message: 'This may involve a safety or crisis concern, so we are connecting you with a person instead of giving an automated answer.',
    target: { id: 'NBCC-SS-005', title: 'Wellness and Counselling', url: 'https://nbcc.ca/student-services/wellness-counselling' },
  },
  showImmediateDangerNotice: true,
}

const noSourceResult: NavigateResult = {
  query: 'zzqx unrelated gibberish',
  journey: 'general_contact',
  hasSource: false,
  source: null,
  why: 'None of our approved NBCC Student Services sources address this question, so we cannot give an informational answer here.',
  whatToDoNext: 'Contact NBCC directly using the general contact details below.',
  escalation: {
    should_escalate: true,
    trigger: 'unmatched_query',
    message: 'We do not have an approved source for this question, so we are connecting you with NBCC’s general contact team.',
    target: { id: 'NBCC-SS-007', title: 'Contact NBCC', url: 'https://nbcc.ca/contact-us' },
  },
  showImmediateDangerNotice: false,
}

describe('Home page — learner service-resolution UX', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('shows the demonstrator notice', () => {
    render(<Home />)
    expect(screen.getByText(/do not enter personal information/i)).toBeInTheDocument()
  })

  test('shows an empty state before any query', () => {
    render(<Home />)
    expect(screen.getByText(/ask a question above/i)).toBeInTheDocument()
  })

  test('submitting a question calls the navigate API and renders the result', async () => {
    mockFetchOnce(wellbeingResult)
    render(<Home />)

    const input = screen.getByLabelText(/what can we help you with today/i)
    fireEvent.change(input, { target: { value: wellbeingResult.query } })
    fireEvent.click(screen.getByRole('button', { name: /find my service/i }))

    await waitFor(() => expect(screen.getByText('Wellbeing and Safety')).toBeInTheDocument())
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/navigate?q='))
  })

  test('GQ-04 wording renders the immediate-danger notice and escalation target', async () => {
    mockFetchOnce(wellbeingResult)
    render(<Home />)

    fireEvent.click(screen.getByRole('button', { name: /wellbeing \/ safety/i }))

    await waitFor(() => expect(screen.getByText(/immediate danger/i)).toBeInTheDocument())
    expect(screen.getAllByText('Wellness and Counselling', { selector: 'a' }).length).toBeGreaterThan(0)
  })

  test('a no-source result tells the learner there is no approved source and offers general contact', async () => {
    mockFetchOnce(noSourceResult)
    render(<Home />)

    const input = screen.getByLabelText(/what can we help you with today/i)
    fireEvent.change(input, { target: { value: noSourceResult.query } })
    fireEvent.click(screen.getByRole('button', { name: /find my service/i }))

    await waitFor(() => expect(screen.getByText(/do not have an approved nbcc source/i)).toBeInTheDocument())
    expect(screen.getByText('Contact NBCC', { selector: 'a' })).toBeInTheDocument()
  })

  test('a fetch failure shows an error state, not a fabricated result', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Navigation error: boom' }),
    }) as jest.Mock
    render(<Home />)

    const input = screen.getByLabelText(/what can we help you with today/i)
    fireEvent.change(input, { target: { value: 'anything' } })
    fireEvent.click(screen.getByRole('button', { name: /find my service/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})
