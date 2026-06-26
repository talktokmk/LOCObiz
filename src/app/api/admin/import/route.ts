import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown[]
  try {
    body = await request.json()
  } catch (parseErr) {
    const msg = parseErr instanceof Error ? parseErr.message : 'Unknown parse error'
    return NextResponse.json({ error: `Invalid JSON body: ${msg}` }, { status: 400 })
  }

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ error: 'Send a JSON array of businesses' }, { status: 400 })
  }

  const catResult = await db.execute('SELECT slug FROM categories')
  const validCategories = new Set(catResult.rows.map((r: Record<string, unknown>) => r.slug as string))

  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  for (let i = 0; i < body.length; i++) {
    const item = body[i] as Record<string, unknown>

    if (!item.name || typeof item.name !== 'string') {
      errors.push(`Row ${i + 1}: missing name`)
      skipped++
      continue
    }

    const name = item.name.trim()
    if (!name) {
      errors.push(`Row ${i + 1}: empty name`)
      skipped++
      continue
    }

    let catSlug = (item.category || item.category_slug || 'local-services') as string
    catSlug = String(catSlug).toLowerCase().replace(/\s+/g, '-')
    if (!validCategories.has(catSlug)) {
      if (validCategories.has('local-services')) {
        catSlug = 'local-services'
      } else {
        errors.push(`Row ${i + 1} ("${name}"): invalid category "${catSlug}" — no fallback category exists`)
        skipped++
        continue
      }
    }

    const city = String(item.city ?? '').trim() || 'Mumbai'
    const area = String(item.area ?? '').trim() || ''
    const district = String(item.district ?? '').trim() || ''
    const state = String(item.state ?? '').toLowerCase().replace(/\s+/g, '-') || 'maharashtra'
    const phone = String(item.phone ?? '').trim() || ''
    const description = String(item.description ?? '').trim() || `${name} — a trusted ${catSlug} service in ${area || city}.`
    const rating = Math.min(5, Math.max(0, Number(item.rating) || 0))
    const servicesRaw = item.services
    let services = '[]'
    if (servicesRaw) {
      if (Array.isArray(servicesRaw)) services = JSON.stringify(servicesRaw)
      else if (typeof servicesRaw === 'string') {
        try { JSON.parse(servicesRaw); services = servicesRaw } catch { services = '[]' }
      }
    }
    const website = String(item.website ?? '').trim() || ''
    const whatsapp = String(item.whatsapp ?? '').trim() || ''
    const address = String(item.address ?? '').trim() || `${area ? area + ', ' : ''}${city}`
    const featured = item.featured ? 1 : 0
    const verified = item.verified ? 1 : 0

    const baseSlug = slugify(name)
    const slug = `${baseSlug}-${slugify(city)}-${Date.now()}-${i}`

    try {
      await db.execute({
        sql: `INSERT INTO businesses (name, slug, category_id, category_slug, city, district, state, area,
              address, phone, website, whatsapp, description, services, rating, featured, verified, views, status)
              SELECT ?, ?, id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending' FROM categories WHERE slug = ?`,
        args: [name, slug, catSlug, city, district, state, area, address, phone, website, whatsapp,
          description, services, rating, featured, verified, 0, catSlug],
      })
      inserted++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown error'
      errors.push(`Row ${i + 1} ("${name}"): ${msg}`)
      skipped++
    }
  }

  return NextResponse.json({ inserted, skipped, errors: errors.slice(0, 20) })
}
