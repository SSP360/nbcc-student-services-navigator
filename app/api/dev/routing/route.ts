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

  try {
    const results = searchCuratedSources(query)
    const routing = routeQuery(query, results)
    const escalation = decideEscalation(query, routing.journey, results.length)

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
