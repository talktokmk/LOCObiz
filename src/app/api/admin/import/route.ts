import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: 'Send a JSON array of businesses' }, { status: 400 })
    }

    const catResult = await db.execute('SELECT slug FROM categories')
    const validCategories = new Set(catResult.rows.map((r: Record<string, unknown>) => r.slug as string))

    let inserted = 0
    let skipped = 0
    const errors: string[] = []

    for (let i = 0; i < body.length; i++) {
      const item = body[i]

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

      const catSlug = (item.category || item.category_slug || 'restaurants').toLowerCase().replace(/\s+/g, '-')
      if (!validCategories.has(catSlug)) {
        errors.push(`Row ${i + 1} ("${name}"): invalid category "${catSlug}"`)
        skipped++
        continue
      }

      const city = item.city?.trim() || 'Mumbai'
      const area = item.area?.trim() || ''
      const district = item.district?.trim() || ''
      const state = (item.state || '').toLowerCase().replace(/\s+/g, '-') || 'maharashtra'
      const phone = item.phone?.trim() || ''
      const description = item.description?.trim() || `${name} — a trusted ${catSlug} service in ${area || city}.`
      const rating = Math.min(5, Math.max(0, Number(item.rating) || 0))
      const services = item.services ? (Array.isArray(item.services) ? JSON.stringify(item.services) : item.services) : '[]'
      const website = item.website?.trim() || ''
      const whatsapp = item.whatsapp?.trim() || ''
      const address = item.address?.trim() || `${area ? area + ', ' : ''}${city}`
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
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}
