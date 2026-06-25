import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

const PLACES_TEXT_SEARCH = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
const PLACE_DETAILS = 'https://maps.googleapis.com/maps/api/place/details/json'
const MAX_PER_IMPORT = 50

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const action = body.action || 'search'

    if (action === 'search') {
      return handleSearch(body)
    }
    if (action === 'import') {
      return handleImport(body)
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

async function handleSearch(body: Record<string, unknown>) {
  const apiKey = body.apiKey as string
  if (!apiKey) {
    return NextResponse.json({ error: 'Google API key required' }, { status: 400 })
  }

  const query = body.query as string
  const city = body.city as string
  const category = body.category as string || ''
  if (!query && !city) {
    return NextResponse.json({ error: 'Search query or city required' }, { status: 400 })
  }

  const searchQuery = query
    ? `${query} in ${city || ''}`
    : `${category} in ${city}`
  const pageToken = body.pageToken as string || ''

  const params = new URLSearchParams({
    query: searchQuery.trim(),
    key: apiKey,
  })
  if (pageToken) params.set('pagetoken', pageToken)

  const res = await fetch(`${PLACES_TEXT_SEARCH}?${params}`, {
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) {
    const errText = await res.text()
    return NextResponse.json({ error: `Google API error: ${errText}` }, { status: 502 })
  }

  const data = await res.json()
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return NextResponse.json({ error: `Google API: ${data.status} — ${data.error_message || ''}` }, { status: 502 })
  }

  const results = (data.results || []).map((r: Record<string, unknown>) => ({
    placeId: r.place_id,
    name: r.name,
    address: r.formatted_address || '',
    rating: r.rating || null,
    vicinity: r.vicinity || '',
    types: r.types || [],
    icon: r.icon || '',
  }))

  return NextResponse.json({
    results,
    nextPageToken: data.next_page_token || null,
    searchQuery: searchQuery.trim(),
  })
}

async function handleImport(body: Record<string, unknown>) {
  const apiKey = body.apiKey as string
  const selected = body.selected as { placeId: string; category: string; city?: string }[]
  if (!apiKey || !Array.isArray(selected) || selected.length === 0) {
    return NextResponse.json({ error: 'API key and selected places required' }, { status: 400 })
  }

  if (selected.length > MAX_PER_IMPORT) {
    return NextResponse.json({ error: `Max ${MAX_PER_IMPORT} per import` }, { status: 400 })
  }

  const catResult = await db.execute('SELECT slug, id FROM categories')
  const catMap = new Map<string, number>()
  const catSlugs = new Set<string>()
  for (const r of catResult.rows as Record<string, unknown>[]) {
    catSlugs.add(r.slug as string)
    catMap.set(r.slug as string, r.id as number)
  }

  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  for (const item of selected) {
    const catSlug = (item.category || 'restaurants').toLowerCase().replace(/\s+/g, '-')
    if (!catSlugs.has(catSlug)) {
      errors.push(`"${item.placeId}": invalid category "${catSlug}"`)
      skipped++
      continue
    }

    try {
      const params = new URLSearchParams({
        place_id: item.placeId,
        fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,rating,url,opening_hours,geometry',
        key: apiKey,
      })
      const res = await fetch(`${PLACE_DETAILS}?${params}`, {
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) {
        errors.push(`"${item.placeId}": API error ${res.status}`)
        skipped++
        continue
      }

      const data = await res.json()
      if (data.status !== 'OK' || !data.result) {
        errors.push(`"${item.placeId}": ${data.status}`)
        skipped++
        continue
      }

      const p = data.result as Record<string, unknown>

      const name = (p.name as string || '').trim()
      if (!name) {
        errors.push(`"${item.placeId}": empty name`)
        skipped++
        continue
      }

      const address = (p.formatted_address as string) || (p.vicinity as string) || ''
      const phone = (p.international_phone_number as string) || (p.formatted_phone_number as string) || ''
      const website = (p.website as string) || ''
      const rating = p.rating != null ? Math.min(5, Math.max(0, Number(p.rating))) : 0
      const geometry = p.geometry as Record<string, unknown> | undefined
      const location = geometry?.location as Record<string, unknown> | undefined
      const lat = location?.lat as number | null ?? null
      const lng = location?.lng as number | null ?? null

      const city = item.city || ''
      const citySlug = slugify(city)
      const baseSlug = slugify(name)
      const slug = `${baseSlug}-${citySlug}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

      const catId = catMap.get(catSlug)!

      await db.execute({
        sql: `INSERT INTO businesses (name, slug, category_id, category_slug, city, address, phone, website, description, services, rating, latitude, longitude, featured, verified, views)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [name, slug, catId, catSlug, city, address, phone, website,
          `${name} — ${address}`,
          '[]', rating, lat, lng, 0, 1, Math.floor(Math.random() * 100 + 1)],
      })
      inserted++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      errors.push(`"${item.placeId}": ${msg}`)
      skipped++
    }
  }

  return NextResponse.json({ inserted, skipped, errors: errors.slice(0, 30) })
}
