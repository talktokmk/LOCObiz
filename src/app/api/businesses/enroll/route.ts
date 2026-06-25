import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, category_slug, city, area, address, website, description, owner_name, owner_whatsapp } = body

    if (!name || !phone || !category_slug || !city) {
      return NextResponse.json({ error: 'Business name, phone, category, and city are required' }, { status: 400 })
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
      args: [phone],
    })
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: 'A business with this phone number is already listed' }, { status: 409 })
    }

    const slug = `${slugify(name)}-${slugify(city)}-${Date.now()}`
    const desc = description || `${name} — ${area ? area + ', ' : ''}${city}`

    await db.execute({
      sql: `INSERT INTO businesses (name, slug, category_id, category_slug, city, area, address, phone, website, description, services, rating, reviews_count, verified, views, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      args: [name.trim(), slug, catId, category_slug, city.trim(), area?.trim() || null, address?.trim() || null,
        phone.trim(), website?.trim() || null, desc, '[]', 0, 0, 0, 0],
    })

    return NextResponse.json({ success: true, message: 'Your business has been submitted for review. We will notify you once it is approved.' })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
