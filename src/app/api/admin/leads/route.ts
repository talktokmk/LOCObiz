import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200)
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

  const result = await db.execute({
    sql: `SELECT l.*, b.name as business_name, b.slug as business_slug
          FROM leads l
          LEFT JOIN businesses b ON l.business_id = b.id
          ORDER BY l.created_at DESC
          LIMIT ? OFFSET ?`,
    args: [limit, offset],
  })

  return NextResponse.json(result.rows)
}
