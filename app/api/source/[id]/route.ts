import { NextResponse, NextRequest } from 'next/server'
import { RetrievedSourceContent } from '@/lib/types'
import { getSourceById, fetchSourceContent } from '@/lib/sources'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<RetrievedSourceContent | { error: string }>> {
  try {
    const { id } = params
    const source = getSourceById(id)

    if (!source) {
      return NextResponse.json(
        { error: `Source not found: ${id}` },
        { status: 404 }
      )
    }

    try {
      const content = await fetchSourceContent(source)
      const response: RetrievedSourceContent = {
        id: source.id,
        title: source.title,
        url: source.url,
        retrieved_at: content.timestamp,
        retrieval_method: content.method as 'live-fetch' | 'snapshot',
        retrieval_status: 'success',
        extracted_text: content.text,
      }
      return NextResponse.json(response, { status: 200 })
    } catch (fetchError) {
      const response: RetrievedSourceContent = {
        id: source.id,
        title: source.title,
        url: source.url,
        retrieved_at: new Date().toISOString(),
        retrieval_method: 'live-fetch',
        retrieval_status: 'error',
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
      }
      return NextResponse.json(response, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
