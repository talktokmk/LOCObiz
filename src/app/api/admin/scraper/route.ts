import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { detectCategoryFromTypes, detectCategoryFromName, buildSEODescription, ensureCategoryExists, googleTypeToSlug, googleTypeToName } from '@/lib/categories'

const PLACES_TEXT_SEARCH = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
const PLACE_DETAILS = 'https://maps.googleapis.com/maps/api/place/details/json'
const MAX_PER_IMPORT = 50

const INDIAN_STATES = [
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa', 'gujarat',
  'haryana', 'himachal pradesh', 'jharkhand', 'karnataka', 'kerala', 'madhya pradesh',
  'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha', 'orissa', 'punjab',
  'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura', 'uttar pradesh', 'uttarakhand',
  'west bengal', 'andaman and nicobar', 'chandigarh', 'dadra and nagar haveli',
  'daman and diu', 'delhi', 'jammu and kashmir', 'ladakh', 'lakshadweep', 'puducherry',
]

const STATE_SLUGS: Record<string, string> = {
  'andhra pradesh': 'andhra-pradesh', 'arunachal pradesh': 'arunachal-pradesh',
  assam: 'assam', bihar: 'bihar', chhattisgarh: 'chhattisgarh', goa: 'goa',
  gujarat: 'gujarat', haryana: 'haryana', 'himachal pradesh': 'himachal-pradesh',
  jharkhand: 'jharkhand', karnataka: 'karnataka', kerala: 'kerala',
  'madhya pradesh': 'madhya-pradesh', maharashtra: 'maharashtra',
  manipur: 'manipur', meghalaya: 'meghalaya', mizoram: 'mizoram', nagaland: 'nagaland',
  odisha: 'odisha', orissa: 'odisha', punjab: 'punjab', rajasthan: 'rajasthan',
  sikkim: 'sikkim', 'tamil nadu': 'tamil-nadu', telangana: 'telangana',
  tripura: 'tripura', 'uttar pradesh': 'uttar-pradesh', uttarakhand: 'uttarakhand',
  'west bengal': 'west-bengal', delhi: 'delhi',
}

function parseIndianAddress(address: string, fallbackCity: string) {
  const result: Record<string, string> = { area: '', city: fallbackCity || '', district: '', state: '', stateSlug: '', pincode: '' }
  if (!address) return result

  const pincodeMatch = address.match(/\b(\d{6})\b/)
  if (pincodeMatch) result.pincode = pincodeMatch[1]

  const parts = address.split(',').map((p) => p.trim()).filter(Boolean)

  for (const part of parts) {
    const lower = part.toLowerCase()
    const found = INDIAN_STATES.find((s) => lower.includes(s))
    if (found) {
      result.state = found === 'orissa' ? 'Odisha' : found.replace(/\b\w/g, (c: string) => c.toUpperCase())
      result.stateSlug = STATE_SLUGS[found] || found.toLowerCase().replace(/\s+/g, '-')
      break
    }
  }

  const stateIdx = parts.findIndex((p) => {
    const lower = p.toLowerCase()
    return INDIAN_STATES.some((s) => lower.includes(s) || lower.endsWith(s))
  })

  if (stateIdx > 0) {
    const cityCandidate = parts[stateIdx - 1].replace(/\d{6}/g, '').trim()
    if (cityCandidate) result.city = cityCandidate
    if (stateIdx > 1) result.area = parts.slice(0, stateIdx - 1).join(', ')
    else result.area = parts.slice(0, stateIdx).join(', ')
    if (stateIdx >= 2) {
      result.district = parts[stateIdx - 1].replace(/\d{6}/g, '').trim()
    }
  }

  if (!result.city && fallbackCity) result.city = fallbackCity
  return result
}

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

  const catResult = await db.execute('SELECT slug FROM categories')
  const validSlugs = new Set(catResult.rows.map((r: Record<string, unknown>) => r.slug as string))

  const results = (data.results || []).map((r: Record<string, unknown>) => {
    const types = (r.types || []) as string[]
    const name = (r.name || '') as string
    let detected = detectCategoryFromTypes(types)
    if (!detected) detected = detectCategoryFromName(name)
    const suggestedFromTypes = !detected && types.length > 0
      ? types[0].replace(/_/g, '-').toLowerCase()
      : ''
    if (!detected || !validSlugs.has(detected)) detected = ''
    return {
      placeId: r.place_id,
      name,
      address: r.formatted_address || '',
      rating: r.rating || null,
      vicinity: r.vicinity || '',
      types,
      icon: r.icon || '',
      detectedCategory: detected,
      category: detected || suggestedFromTypes || undefined,
    }
  })

  return NextResponse.json({
    results,
    nextPageToken: data.next_page_token || null,
    searchQuery: searchQuery.trim(),
  })
}

async function handleImport(body: Record<string, unknown>) {
  const apiKey = body.apiKey as string
  const selected = body.selected as { placeId: string; name?: string; category?: string; city?: string; types?: string[] }[]
  if (!apiKey || !Array.isArray(selected) || selected.length === 0) {
    return NextResponse.json({ error: 'API key and selected places required' }, { status: 400 })
  }

  if (selected.length > MAX_PER_IMPORT) {
    return NextResponse.json({ error: `Max ${MAX_PER_IMPORT} per import` }, { status: 400 })
  }

  const catResult = await db.execute('SELECT slug, id FROM categories')
  const catMap = new Map<string, number>()
  for (const r of catResult.rows as Record<string, unknown>[]) {
    catMap.set(r.slug as string, r.id as number)
  }

  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  for (const item of selected) {
    let catSlug = (item.category || '').toLowerCase().replace(/\s+/g, '-')
    if (!catSlug || !catMap.has(catSlug)) {
      const types = item.types || []
      const name = item.name || item.placeId || ''
      catSlug = detectCategoryFromTypes(types) || detectCategoryFromName(name) || ''

      if (catSlug && !catMap.has(catSlug)) {
        const catIdNew = await ensureCategoryExists(db, catSlug)
        if (catIdNew) { catMap.set(catSlug, catIdNew) }
      }

      if ((!catSlug || !catMap.has(catSlug)) && types.length > 0) {
        catSlug = types[0].replace(/_/g, '-').toLowerCase()
        const catIdNew = await ensureCategoryExists(db, catSlug)
        if (catIdNew) { catMap.set(catSlug, catIdNew) }
      }

      if (!catSlug || !catMap.has(catSlug)) { skipped++; continue }
    }

    // Dedup by place_id
    const existing = await db.execute({
      sql: 'SELECT id FROM businesses WHERE place_id = ? LIMIT 1',
      args: [item.placeId],
    })
    if (existing.rows.length > 0) { skipped++; continue }

    try {
      const fields = 'name,formatted_address,formatted_phone_number,international_phone_number,website,rating,url,opening_hours,geometry,types'
      const params = new URLSearchParams({
        place_id: item.placeId,
        fields,
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

      const address = (p.formatted_address as string) || ''
      const phone = (p.international_phone_number as string) || (p.formatted_phone_number as string) || ''
      const website = (p.website as string) || ''
      const rating = p.rating != null ? Math.min(5, Math.max(0, Number(p.rating))) : 0
      const geometry = p.geometry as Record<string, unknown> | undefined
      const location = geometry?.location as Record<string, unknown> | undefined
      const lat = location?.lat as number | null ?? null
      const lng = location?.lng as number | null ?? null
      const placeId = item.placeId

      const googleTypes = (p.types as string[]) || item.types || []

      if (!catSlug || !catMap.has(catSlug)) {
        const reDetected = detectCategoryFromTypes(googleTypes) || detectCategoryFromName(name)
        if (reDetected && catMap.has(reDetected)) catSlug = reDetected
        else catSlug = 'restaurants'
      }

      const city = item.city || ''

      // Parse address for area/city/district/state
      const parsed = parseIndianAddress(address, city)

      const citySlug = slugify(parsed.city || city)
      const baseSlug = slugify(name)
      const slug = `${baseSlug}-${citySlug}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

      const catId = catMap.get(catSlug)!
      const description = buildSEODescription(name, catSlug, parsed.city || city, parsed.area || '')
      const catName = catSlug.replace(/-/g, ' ')
      const servicesJSON = JSON.stringify([catName, ...(p.types as string[] || []).map((t: string) => t.replace(/_/g, ' '))])

      const openingHours = p.opening_hours
        ? (typeof p.opening_hours === 'object' ? JSON.stringify(p.opening_hours) : String(p.opening_hours))
        : ''

      await db.execute({
        sql: `INSERT INTO businesses (name, slug, category_id, category_slug, city, district, state, area, address, phone, website, opening_hours, description, services, rating, latitude, longitude, place_id, featured, verified, views, status, is_scraped, source)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1, 'api')`,
        args: [name, slug, catId, catSlug, parsed.city || city,
          parsed.district || null, parsed.stateSlug || null, parsed.area || null,
          address, phone, website, openingHours,
          description,
          servicesJSON, rating, lat, lng, placeId, 0, 0, 0],
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
