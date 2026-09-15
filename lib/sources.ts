import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { Source, SourcesYaml, ALLOWED_DOMAINS, ALLOWED_AUTHORITIES, ALLOWED_REVIEW_STATUSES } from './types'

let cachedSources: Source[] | null = null

function validateSource(source: any): source is Source {
  if (!source.id || typeof source.id !== 'string') return false
  if (!source.title || typeof source.title !== 'string') return false
  if (!source.url || typeof source.url !== 'string') return false
  if (!source.url.startsWith('https://')) return false
  if (!source.domain || typeof source.domain !== 'string') return false
  if (!Array.isArray(source.campuses)) return false
  if (!Array.isArray(source.languages)) return false
  if (!source.source_type || typeof source.source_type !== 'string') return false
  if (!source.authority || typeof source.authority !== 'string') return false
  if (!ALLOWED_AUTHORITIES.includes(source.authority)) return false
  if (!source.retrieved_at || typeof source.retrieved_at !== 'string') return false
  if (typeof source.time_sensitive !== 'boolean') return false
  if (!source.review_status || typeof source.review_status !== 'string') return false
  if (!ALLOWED_REVIEW_STATUSES.includes(source.review_status)) return false

  const urlObj = new URL(source.url)
  if (!ALLOWED_DOMAINS.includes(urlObj.hostname)) return false

  return true
}

export function loadSources(): Source[] {
  if (cachedSources) {
    return cachedSources
  }

  const sourcesPath = path.join(process.cwd(), 'knowledge', 'sources.yaml')
  const fileContent = fs.readFileSync(sourcesPath, 'utf-8')
  const parsed = yaml.load(fileContent) as SourcesYaml

  if (!parsed.sources || !Array.isArray(parsed.sources)) {
    throw new Error('sources.yaml must contain a "sources" array')
  }

  const validatedSources: Source[] = []
  for (const source of parsed.sources) {
    if (!validateSource(source)) {
      throw new Error(`Invalid source: ${JSON.stringify(source)}`)
    }
    validatedSources.push(source)
  }

  cachedSources = validatedSources
  return validatedSources
}

export function getSourceById(id: string): Source | undefined {
  const sources = loadSources()
  return sources.find(s => s.id === id)
}

export function getAllSources(): Source[] {
  return loadSources()
}

export interface FetchContentResult {
  text: string
  timestamp: string
  method: 'live-fetch' | 'snapshot'
  httpStatus?: number
  contentLength?: number
}

export async function fetchSourceContent(source: Source): Promise<FetchContentResult> {
  let httpStatus: number | undefined
  let contentLength: number | undefined

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'NBCC-Student-Services-Navigator/0.1.0',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    httpStatus = response.status
    contentLength = response.headers.get('content-length') ? parseInt(response.headers.get('content-length')!, 10) : undefined

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const extracted = extractTextFromHtml(html)

    return {
      text: extracted,
      timestamp: new Date().toISOString(),
      method: 'live-fetch',
      httpStatus,
      contentLength,
    }
  } catch (error) {
    const snapshotPath = path.join(process.cwd(), 'knowledge', 'raw', `${source.id}.html`)
    if (fs.existsSync(snapshotPath)) {
      const html = fs.readFileSync(snapshotPath, 'utf-8')
      const extracted = extractTextFromHtml(html)
      return {
        text: extracted,
        timestamp: new Date().toISOString(),
        method: 'snapshot',
        contentLength: html.length,
      }
    }
    throw new Error(`Failed to fetch ${source.url}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function extractTextFromHtml(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  try {
    const doc = new (require('jsdom').JSDOM)(html)
    const body = doc.window.document.body

    if (!body) {
      return ''
    }

    const scriptAndStyleElements = body.querySelectorAll('script, style, nav, .sidebar, .menu')
    scriptAndStyleElements.forEach((el: any) => el.remove())

    const textContent = body.textContent || ''
    if (!textContent) {
      return ''
    }

    const processed = textContent
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .join('\n')

    return processed.substring(0, 5000)
  } catch (error) {
    return ''
  }
}
