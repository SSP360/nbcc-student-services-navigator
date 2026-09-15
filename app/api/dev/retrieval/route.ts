import { NextResponse, NextRequest } from 'next/server'
import { searchCuratedSources, RetrievalResult } from '@/lib/retrieval'

export interface RetrievalApiResponse {
  query: string
  result_count: number
  results: RetrievalResult[]
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<RetrievalApiResponse | { error: string }>> {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const query = request.nextUrl.searchParams.get('q') || ''

  try {
    const results = searchCuratedSources(query)
    return NextResponse.json(
      { query, result_count: results.length, results },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: `Retrieval error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
