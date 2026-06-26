import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const FIELD_MAP: Record<string, Record<string, string>> = {
  name: { name: 'name', 'business name': 'name', 'business_name': 'name', title: 'name', 'company name': 'name', 'company_name': 'name' },
  category: { category: 'category', 'category slug': 'category', 'category_slug': 'category', type: 'category', 'business type': 'category', 'business_type': 'category', 'service type': 'category', 'service_type': 'category' },
  city: { city: 'city', town: 'city', location: 'city' },
  area: { area: 'area', locality: 'area', neighborhood: 'area', suburb: 'area', sector: 'area' },
  district: { district: 'district', region: 'district' },
  state: { state: 'state', province: 'state' },
  phone: { phone: 'phone', telephone: 'phone', mobile: 'phone', contact: 'phone', 'phone number': 'phone', 'phone_number': 'phone', 'contact number': 'phone', 'contact_number': 'phone' },
  whatsapp: { whatsapp: 'whatsapp', 'whatsapp number': 'whatsapp', 'whatsapp_number': 'whatsapp', 'wa number': 'whatsapp', 'wa_number': 'whatsapp' },
  email: { email: 'email', 'e-mail': 'email', mail: 'email' },
  website: { website: 'website', web: 'website', url: 'website', site: 'website', 'web address': 'website', 'web_address': 'website' },
  address: { address: 'address', 'full address': 'address', 'full_address': 'address', 'location address': 'address', 'location_address': 'address' },
  rating: { rating: 'rating', rate: 'rating', stars: 'rating', score: 'rating' },
  reviews_count: { reviews: 'reviews_count', 'reviews count': 'reviews_count', 'reviews_count': 'reviews_count', 'review count': 'reviews_count', 'review_count': 'reviews_count' },
  description: { description: 'description', desc: 'description', about: 'description', details: 'description', summary: 'description', blurb: 'description' },
  services: { services: 'services', service: 'services', offerings: 'services', products: 'services' },
  featured: { featured: 'featured', 'featured business': 'featured', 'featured_business': 'featured', priority: 'featured' },
  verified: { verified: 'verified', 'is verified': 'verified', 'is_verified': 'verified', claim: 'verified', claimed: 'verified' },
  'google_maps_url': { 'google maps url': 'google_maps_url', 'google_maps_url': 'google_maps_url', 'maps url': 'google_maps_url', 'maps_url': 'google_maps_url', gmaps: 'google_maps_url', 'google maps': 'google_maps_url', 'google_maps': 'google_maps_url' },
  place_id: { 'place id': 'place_id', 'place_id': 'place_id', 'google place id': 'place_id', 'google_place_id': 'place_id', 'gmaps id': 'place_id', 'gmaps_id': 'place_id' },
  latitude: { latitude: 'latitude', lat: 'latitude' },
  longitude: { longitude: 'longitude', lng: 'longitude', long: 'longitude' },
  'opening_hours': { 'opening hours': 'opening_hours', 'opening_hours': 'opening_hours', hours: 'opening_hours', timings: 'opening_hours', 'business hours': 'opening_hours', 'business_hours': 'opening_hours' },
  source: { source: 'source', 'data source': 'source', 'data_source': 'source' },
}

function detectMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  const usedKeys = new Set<string>()
  const aliasLookup: [string, string][] = []
  for (const [, aliases] of Object.entries(FIELD_MAP)) {
    for (const [alias, field] of Object.entries(aliases)) {
      aliasLookup.push([alias.toLowerCase().replace(/[_\s-]+/g, ' ').trim(), field])
    }
  }

  for (const raw of headers) {
    const key = raw.trim().toLowerCase().replace(/[_\s-]+/g, ' ').trim()
    let matched = false
    for (const [normalizedAlias, field] of aliasLookup) {
      if (key === normalizedAlias && !usedKeys.has(field)) {
        mapping[raw] = field
        usedKeys.add(field)
        matched = true
        break
      }
    }
    if (!matched) {
      // Try fuzzy: if alias is contained in key or vice versa
      for (const [normalizedAlias, field] of aliasLookup) {
        if (!usedKeys.has(field) && (key.includes(normalizedAlias) || normalizedAlias.includes(key))) {
          mapping[raw] = field
          usedKeys.add(field)
          matched = true
          break
        }
      }
    }
    if (!matched) {
      mapping[raw] = ''
    }
  }
  return mapping
}

function parseCSV(text: string): Record<string, string>[] {
  // Strip BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)

  const lines: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = false
      } else current += ch
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === '\n') { lines.push(current); current = '' }
      else if (ch === '\r') { /* skip */ }
      else current += ch
    }
  }
  if (current) lines.push(current)

  const dataLines = lines.filter(l => l.trim())
  if (dataLines.length < 2) return []

  const headers = parseCSVLine(dataLines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < dataLines.length; i++) {
    const vals = parseCSVLine(dataLines[i])
    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = vals[j] ?? ''
    }
    rows.push(row)
  }

  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = false
      } else current += ch
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { result.push(current.trim()); current = '' }
      else current += ch
    }
  }
  result.push(current.trim())
  return result
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()

    let rawData: Record<string, string>[]

    if (ext === 'csv') {
      const text = await file.text()
      rawData = parseCSV(text)
    } else if (ext === 'xlsx' || ext === 'xls') {
      try {
        const XLSX = await import('xlsx')
        const buf = new Uint8Array(await file.arrayBuffer())
        const workbook = XLSX.read(buf, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) throw new Error('No sheets found in workbook')
        const sheet = workbook.Sheets[sheetName]
        rawData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ error: `Could not parse Excel file: ${msg}. Try saving as CSV and uploading again.` }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload a CSV or Excel file.' }, { status: 400 })
    }

    if (rawData.length === 0) {
      return NextResponse.json({ error: 'No data rows found' }, { status: 400 })
    }

    const headers = Object.keys(rawData[0])
    const columnMapping = detectMapping(headers)

    return NextResponse.json({
      rows: rawData,
      totalRows: rawData.length,
      headers,
      columnMapping,
      fileName: file.name,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to parse file: ${msg}` }, { status: 400 })
  }
}
