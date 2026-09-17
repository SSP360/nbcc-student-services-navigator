/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'
import type { ResolutionResult } from '@/lib/resolution/types'

function mockFetchOnce(result: ResolutionResult, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => result,
  }) as jest.Mock
}

const confidentAcademic: ResolutionResult = {
  state: 'confident_route',
  message: 'Based on what you shared, Student Success Coaching is the right place to start.',
  journey: 'academic_support',
  source: { id: 'NBCC-SS-002', title: 'Student Success Coaching', url: 'https://nbcc.ca/student-services/student-success-coaching' },
  primaryAction: { label: 'Visit Student Success Coaching', href: 'https://nbcc.ca/student-services/student-success-coaching' },
  recoveryAction: { label: 'Not the right service?', href: 'https://nbcc.ca/student-services' },
}

const safetyEscalation: ResolutionResult = {
  state: 'safety_escalation',
  message: 'This may involve a safety or crisis concern.',
  journey: 'wellbeing_safety',
  source: { id: 'NBCC-SS-005', title: 'Wellness and Counselling', url: 'https://nbcc.ca/student-services/wellness-counselling' },
  primaryAction: { label: 'Get urgent help now', href: 'https://nbcc.ca/student-services/wellness-counselling' },
  recoveryAction: { label: 'Not the right service?', href: 'https://nbcc.ca/student-services' },
  escalation: {
    message: 'If you are in immediate danger, contact local emergency services.',
    action: { label: 'Get urgent help now', href: 'https://nbcc.ca/student-services/wellness-counselling' },
  },
}

const unsupported: ResolutionResult = {
  state: 'unsupported_query',
  message: "We don't have a specific match for this request.",
  journey: 'general_student_services',
  source: { id: 'NBCC-SS-001', title: 'Student Services at NBCC', url: 'https://nbcc.ca/student-services' },
  primaryAction: { label: 'Contact General Student Services', href: 'https://nbcc.ca/student-services' },
  recoveryAction: { label: 'Choose a category instead' },
}

const guided: ResolutionResult = {
  state: 'guided_choice',
  message: 'This could involve more than one area.',
  primaryAction: { label: 'Choose the closest match below' },
  recoveryAction: { label: 'Not the right service?', href: 'https://nbcc.ca/student-services' },
  options: [
    { label: 'Academic support', journey: 'academic_support' },
    { label: 'General student services', journey: 'general_student_services' },
  ],
}

describe('Home page — resolution-first dual-entry UX', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('shows the demonstrator notice', () => {
    render(<Home />)
    expect(screen.getByText(/do not enter personal information/i)).toBeInTheDocument()
  })

  test('shows all six category cards without requiring free text (F-01, F-06)', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: 'Academic support' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Money, fees, and financial aid' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accommodations and accessibility' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Wellbeing and safety' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'General student services' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "I'm not sure where to start" })).toBeInTheDocument()
  })

  test('the urgent-help route is visible and usable without any search submission (F-16, A-09)', async () => {
    mockFetchOnce(safetyEscalation)
    render(<Home />)
    const urgentButton = screen.getByRole('button', { name: /need urgent help or feel unsafe/i })
    expect(urgentButton).toBeInTheDocument()
    fireEvent.click(urgentButton)
    await waitFor(() => expect(screen.getByText(/immediate danger/i)).toBeInTheDocument())
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('category=urgent'))
  })

  test('clicking a category card resolves without free text (F-01)', async () => {
    mockFetchOnce(confidentAcademic)
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: 'Academic support' }))
    await waitFor(() => expect(screen.getAllByText(/Student Success Coaching/).length).toBeGreaterThan(0))
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('category=academic_support'))
  })

  test('an unsupported query is stated plainly with a General Student Services route (F-12, F-13)', async () => {
    mockFetchOnce(unsupported)
    render(<Home />)
    fireEvent.change(screen.getByLabelText(/describe what you need/i), { target: { value: 'replacement student card' } })
    fireEvent.click(screen.getByRole('button', { name: /find my service/i }))
    await waitFor(() => expect(screen.getByText(/don't have a specific match/i)).toBeInTheDocument())
    expect(screen.getByText('Contact General Student Services')).toBeInTheDocument()
  })

  test('a guided_choice result shows fixed options, never a free-text loop (F-15)', async () => {
    mockFetchOnce(guided)
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: "I'm not sure where to start" }))
    await waitFor(() => expect(screen.getByText(/could involve more than one area/i)).toBeInTheDocument())
    // Two "Academic support" buttons now exist: the always-visible category
    // card and the guided-choice option — confirming the guided options
    // rendered without removing the persistent category grid (A-01/F-17).
    expect(screen.getAllByRole('button', { name: 'Academic support' }).length).toBeGreaterThanOrEqual(2)
  })

  test('every result retains a "not the right service" recovery control (F-18, C-05)', async () => {
    mockFetchOnce(confidentAcademic)
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: 'Academic support' }))
    await waitFor(() => expect(screen.getByRole('button', { name: /not the right service/i })).toBeInTheDocument())
  })

  test('a fetch failure shows an honest error state, not a fabricated result', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Resolution error: boom' }),
    }) as jest.Mock
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: 'Academic support' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})
