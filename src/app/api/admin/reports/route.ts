import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await db.execute(`
    SELECT r.*, b.name as business_name, b.slug as business_slug, b.city
    FROM reports r LEFT JOIN businesses b ON r.business_id = b.id
    ORDER BY r.created_at DESC LIMIT 200
  `)
  return NextResponse.json(result.rows)
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await request.json()
  if (!id || !status) {
    return NextResponse.json({ error: 'id and status required' }, { status: 400 })
  }

  await db.execute({
    sql: "UPDATE reports SET status = ? WHERE id = ?",
    args: [status, id],
  })
  return NextResponse.json({ success: true })
}