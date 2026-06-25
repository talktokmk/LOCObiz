import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { businessId, pageUrl, referrer } = await request.json()
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)

    await db.execute({
      sql: 'INSERT INTO page_views (business_id, page_url, referrer, ip_hash) VALUES (?, ?, ?, ?)',
      args: [businessId || null, pageUrl || '/', referrer || null, ipHash],
    })

    if (businessId) {
      await db.execute({
        sql: 'UPDATE businesses SET views = views + 1 WHERE id = ?',
        args: [businessId],
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
