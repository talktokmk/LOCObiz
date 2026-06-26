import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { slug, name, phone } = await request.json()
    if (!slug || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const biz = await db.execute({
      sql: "SELECT id, claimed FROM businesses WHERE slug = ? AND status = 'approved'",
      args: [slug],
    })

    if (biz.rows.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = biz.rows[0] as unknown as { id: number; claimed: number }
    if (business.claimed) {
      return NextResponse.json({ error: 'Business already claimed' }, { status: 409 })
    }

    await db.execute({
      sql: "INSERT INTO leads (business_id, name, phone, message, source) VALUES (?, ?, ?, ?, 'claim')",
      args: [business.id, name, phone, `Claim request for ${slug}`],
    })

    return NextResponse.json({ success: true, message: 'Claim submitted successfully' })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
