import { NextResponse, NextRequest } from 'next/server'
import { navigate, NavigateResult } from '@/lib/navigate'

/**
 * Production-safe learner-facing endpoint. Unlike /api/dev/routing (which
 * exposes raw retrieval scores and matched terms and is development-only),
 * this route returns only the plain-language, learner-safe shape defined by
 * lib/navigate.ts. Available in every environment, including production.
 *
 * No personal data is accepted or stored: `q` is processed in memory for
 * this one request and never written to a file, database, or log.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<NavigateResult | { error: string }>> {
  const query = request.nextUrl.searchParams.get('q') || ''

  if (!query.trim()) {
    return NextResponse.json({ error: 'A question is required.' }, { status: 400 })
  }

  try {
    return NextResponse.json(navigate(query), { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: `Navigation error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
