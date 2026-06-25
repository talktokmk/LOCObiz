import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { businessId, phone, name, message } = await request.json()
    if (!businessId || !phone) {
      return NextResponse.json({ error: 'Business ID and phone required' }, { status: 400 })
    }

    await db.execute({
      sql: 'INSERT INTO leads (business_id, name, phone, message, source) VALUES (?, ?, ?, ?, ?)',
      args: [businessId, name || null, phone, message || null, 'wa.me'],
    })

    await db.execute({
      sql: 'UPDATE businesses SET whatsapp_clicks = whatsapp_clicks + 1 WHERE id = ?',
      args: [businessId],
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
