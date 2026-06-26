import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const ct = request.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }

    const body = await request.json()
    const { name, phone, category_slug, city, area, address, website, description, owner_name, owner_whatsapp } = body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Business name must be at least 2 characters' }, { status: 400 })
    }
    if (!phone || typeof phone !== 'string' || !phone.replace(/[^0-9]/g, '').match(/^\d{10,15}$/)) {
      return NextResponse.json({ error: 'Valid phone number (10-15 digits) is required' }, { status: 400 })
    }
    if (!category_slug || typeof category_slug !== 'string') {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      return NextResponse.json({ error: 'City must be at least 2 characters' }, { status: 400 })
    }

    const catResult = await db.execute({
      sql: 'SELECT id FROM categories WHERE slug = ?',
      args: [category_slug],
    })
    if (catResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    const catId = (catResult.rows[0] as Record<string, unknown>).id as number

    const dup = await db.execute({
      sql: 'SELECT id FROM businesses WHERE phone = ? LIMIT 1',
      args: [phone.replace(/[^0-9]/g, '')],
    })
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: 'A business with this phone number is already listed' }, { status: 409 })
    }

    const slug = `${slugify(name)}-${slugify(city)}-${Date.now()}`
    const desc = description || `${name} — ${area ? area + ', ' : ''}${city}`

    const sanitized = {
      name: name.trim().slice(0, 200),
      phone: phone.trim().slice(0, 20),
      city: city.trim().slice(0, 100),
      area: area?.trim().slice(0, 200) || null,
      address: address?.trim().slice(0, 500) || null,
      website: website?.trim().slice(0, 500) || null,
      description: desc.slice(0, 2000),
    }

    await db.execute({
      sql: `INSERT INTO businesses (name, slug, category_id, category_slug, city, area, address, phone, website, description, services, rating, reviews_count, verified, views, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      args: [sanitized.name, slug, catId, category_slug, sanitized.city, sanitized.area, sanitized.address,
        sanitized.phone, sanitized.website, sanitized.description, '[]', 0, 0, 0, 0],
    })

    return NextResponse.json({ success: true, message: 'Your business has been submitted for review. We will notify you once it is approved.' })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
