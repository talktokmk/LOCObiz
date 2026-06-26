import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { business_id, reporter_name, reporter_phone, reason, details } = await request.json()
    if (!business_id || !reason) {
      return NextResponse.json({ error: 'business_id and reason are required' }, { status: 400 })
    }
    await db.execute({
      sql: "INSERT INTO reports (business_id, reporter_name, reporter_phone, reason, details) VALUES (?, ?, ?, ?, ?)",
      args: [business_id, reporter_name || '', reporter_phone || '', reason, details || ''],
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}