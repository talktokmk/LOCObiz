import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOwnerSession } from '@/lib/owner-auth'

export async function GET(request: NextRequest) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const bizResult = await db.execute({
    sql: "SELECT id FROM businesses WHERE claimed_by = ? AND claimed = 1",
    args: [session.phone],
  })
  if (bizResult.rows.length === 0) {
    return NextResponse.json({ error: 'No claimed business found' }, { status: 404 })
  }
  const bizId = (bizResult.rows[0] as Record<string, unknown>).id as number
  const { searchParams } = request.nextUrl
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200)
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)
  const result = await db.execute({
    sql: 'SELECT id, name, phone, message, source, created_at FROM leads WHERE business_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    args: [bizId, limit, offset],
  })
  return NextResponse.json(result.rows)
}
