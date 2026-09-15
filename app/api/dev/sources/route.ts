import { NextResponse } from 'next/server'
import { getAllSources } from '@/lib/sources'
import { SourcesViewResponse } from '@/lib/types'

export async function GET(): Promise<NextResponse<SourcesViewResponse | { error: string }>> {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const sources = getAllSources()
    const response: SourcesViewResponse = {
      sources,
      count: sources.length,
    }
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to load sources: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
