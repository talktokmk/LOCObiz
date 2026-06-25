import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders })
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  let session = await getSession()
  if (!session) {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey === 'locobiz-extension') {
      session = { id: 0, username: 'extension' }
    }
  }
  if (!session) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const body = await request.json()
    const businesses = body.businesses
    if (!Array.isArray(businesses) || businesses.length === 0) {
      return json({ error: 'Send { businesses: [...] }' }, 400)
    }

    const catResult = await db.execute('SELECT slug, id FROM categories')
    const catMap = new Map<string, number>()
    for (const r of catResult.rows as Record<string, unknown>[]) {
      catMap.set(r.slug as string, r.id as number)
    }

    const defaultCity = (body.city as string) || ''
    let inserted = 0
    let skipped = 0
    const errors: string[] = []

    for (let i = 0; i < businesses.length; i++) {
      const b = businesses[i]
      if (!b.name || typeof b.name !== 'string') { skipped++; continue }
      const name = b.name.trim()
      if (!name) { skipped++; continue }

      let catSlug = mapCategory(b.category || '')
      if (!catMap.has(catSlug)) catSlug = 'restaurants'
      const catId = catMap.get(catSlug)
      if (!catId) { skipped++; continue }

      const phone = b.phone || ''
      const address = b.address || ''
      const website = b.website || ''
      const rating = b.rating != null ? Math.min(5, Math.max(0, Number(b.rating))) : 0
      const reviews = b.reviews ? Number(b.reviews) : 0
      const slug = `${slugify(name)}-${Date.now()}-${i}`

      try {
        await db.execute({
          sql: `INSERT OR IGNORE INTO businesses (name, slug, category_id, category_slug, city, address, phone, website, description, services, rating, reviews_count, verified, views)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [name, slug, catId, catSlug, defaultCity, address, phone, website,
            `${name} — ${address || name}`, '[]', rating, reviews, 1,
            Math.floor(Math.random() * 50 + 1)],
        })
        inserted++
      } catch {
        skipped++
        errors.push(`${name}: insert failed`)
      }
    }

    return json({ inserted, skipped, errors: errors.slice(0, 20) })
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
}

function mapCategory(text: string): string {
  const t = text.toLowerCase()
  const map: [RegExp, string][] = [
    [/restaurant|food|cafe|dining|bakery|cater|hotel/i, 'restaurants'],
    [/salon|spa|beauty|hair|barber|nail|makeup/i, 'salons'],
    [/gym|fitness|yoga|workout|crossfit|zumba/i, 'gyms'],
    [/doctor|clinic|hospital|dentist|physio|ayurvedic|healthcare|medical/i, 'doctors'],
    [/plumber|plumbing|pipe/i, 'plumbers'],
    [/electric|electrical|wiring/i, 'electricians'],
    [/tutor|class|coaching|training|education|learning|academy/i, 'tutors'],
    [/grocery|supermarket|general store|provision|kirana/i, 'grocery'],
    [/pharmacy|medical store|drugstore|chemist/i, 'pharmacies'],
    [/carpenter|carpentry|furniture|wood/i, 'carpenters'],
  ]
  for (const [regex, slug] of map) {
    if (regex.test(t)) return slug
  }
  return 'restaurants'
}
