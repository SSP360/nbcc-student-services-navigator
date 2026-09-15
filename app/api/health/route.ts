import { NextResponse } from 'next/server'
import { HealthResponse } from '@/lib/types'

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const packageJson = require('../../../package.json')

  const response: HealthResponse = {
    status: 'ok',
    service: 'nbcc-student-services-navigator',
    version: packageJson.version,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: 200 })
}
