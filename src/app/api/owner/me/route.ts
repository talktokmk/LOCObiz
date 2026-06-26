import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOwnerSession } from '@/lib/owner-auth'

export async function GET() {
  const session = await getOwnerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const ownerResult = await db.execute({
    sql: 'SELECT id, phone, name FROM owners WHERE id = ?',
    args: [session.id],
  })
  if (ownerResult.rows.length === 0) {
    return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
  }
  const owner = ownerResult.rows[0] as unknown as { id: number; phone: string; name: string }
  const bizResult = await db.execute({
    sql: "SELECT id, name, slug, city, category_slug, rating, featured, verified, views, whatsapp_clicks, status FROM businesses WHERE claimed_by = ? AND claimed = 1",
    args: [owner.phone],
  })
  return NextResponse.json({ owner, businesses: bizResult.rows })
}
