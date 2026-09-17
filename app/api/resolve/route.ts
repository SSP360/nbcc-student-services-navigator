import { NextResponse, NextRequest } from 'next/server'
import { resolveCategory, resolveFreeText, resolveRecovery, CategoryKey } from '@/lib/resolution/engine'
import { ResolutionResult } from '@/lib/resolution/types'

const VALID_CATEGORIES: CategoryKey[] = [
  'academic_support',
  'financial_support',
  'accessibility',
  'wellbeing_safety',
  'general_student_services',
  'unsure',
  'urgent',
]

/**
 * Production-safe learner-facing resolution endpoint (P0.1). Returns only
 * the `ResolutionResult` shape from lib/resolution/types.ts — no raw score,
 * matched term, or internal reason code (C-07). No query text or category
 * selection is logged, stored, or persisted anywhere: it is processed in
 * memory for this one request only, matching the acceptance contract's
 * non-negotiable "no persistent individual free-text storage" rule.
 *
 * GET /api/resolve?category=<key>   — direct category selection (F-01–F-06, F-16)
 * GET /api/resolve?q=<text>         — free-text query (F-07–F-15)
 * GET /api/resolve?recovery=true    — "this is not the right service" (F-18)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ResolutionResult | { error: string }>> {
  const category = request.nextUrl.searchParams.get('category')
  const query = request.nextUrl.searchParams.get('q')
  const recovery = request.nextUrl.searchParams.get('recovery')

  try {
    if (recovery === 'true') {
      return NextResponse.json(resolveRecovery(), { status: 200 })
    }

    if (category) {
      if (!VALID_CATEGORIES.includes(category as CategoryKey)) {
        return NextResponse.json({ error: 'Unknown category.' }, { status: 400 })
      }
      return NextResponse.json(resolveCategory(category as CategoryKey), { status: 200 })
    }

    if (query && query.trim()) {
      return NextResponse.json(resolveFreeText(query), { status: 200 })
    }

    return NextResponse.json({ error: 'A category or question is required.' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: `Resolution error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
