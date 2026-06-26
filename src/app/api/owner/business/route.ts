import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOwnerSession } from '@/lib/owner-auth'

export async function GET() {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await db.execute({
    sql: "SELECT * FROM businesses WHERE claimed_by = ? AND claimed = 1",
    args: [session.phone],
  })
  return NextResponse.json(result.rows)
}

export async function PUT(request: NextRequest) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const bodyFields = body
    const allowedFields = ['name', 'description', 'services', 'phone', 'whatsapp', 'email', 'website', 'address', 'area', 'city', 'district', 'state', 'price_range', 'opening_hours', 'image_url']
    const updates: string[] = []
    const args: (string | number | null)[] = []
    for (const field of allowedFields) {
      if (field in bodyFields) {
        updates.push(`${field} = ?`)
        args.push(bodyFields[field] ?? null)
      }
    }
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    updates.push("updated_at = datetime('now')")
    const bizResult = await db.execute({
      sql: "SELECT id FROM businesses WHERE claimed_by = ? AND claimed = 1",
      args: [session.phone],
    })
    if (bizResult.rows.length === 0) {
      return NextResponse.json({ error: 'No claimed business found' }, { status: 404 })
    }
    const bizId = (bizResult.rows[0] as Record<string, unknown>).id as number
    args.push(bizId)
    await db.execute({
      sql: `UPDATE businesses SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
