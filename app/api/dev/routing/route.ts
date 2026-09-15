import { NextResponse, NextRequest } from 'next/server'
import { searchCuratedSources, RetrievalResult } from '@/lib/retrieval'
import { routeQuery, RoutingResult } from '@/lib/routing'
import { decideEscalation, EscalationDecision } from '@/lib/escalation'

export interface RoutingApiResponse {
  query: string
  retrieval: {
    result_count: number
    results: RetrievalResult[]
  }
  routing: RoutingResult
  escalation: EscalationDecision
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<RoutingApiResponse | { error: string }>> {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const query = request.nextUrl.searchParams.get('q') || ''

  // Retrieval failure (ESCALATION_POLICY.md trigger 6, Source Error) is
  // caught here specifically, at the point retrieval is actually invoked,
  // rather than allowed to fall through to a generic 500. This lets
  // decideEscalation() convert a genuine retrieval failure into a proper
  // escalation decision instead of an opaque server error.
  let results: RetrievalResult[] = []
  let retrievalError: string | null = null
  try {
    results = searchCuratedSources(query)
  } catch (error) {
    retrievalError = error instanceof Error ? error.message : String(error)
  }

  try {
    const routing = routeQuery(query, results)
    const escalation = decideEscalation(query, routing.journey, results.length, retrievalError)

    return NextResponse.json(
      {
        query,
        retrieval: { result_count: results.length, results },
        routing,
        escalation,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: `Routing error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
