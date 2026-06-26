import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generateClaimToken } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200)
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

  const result = await db.execute({
    sql: `SELECT l.id, l.business_id, l.name, l.phone, l.message, l.created_at,
                 b.name as business_name, b.slug as business_slug, b.claimed
          FROM leads l
          LEFT JOIN businesses b ON l.business_id = b.id
          WHERE l.source = 'claim'
          ORDER BY l.created_at DESC
          LIMIT ? OFFSET ?`,
    args: [limit, offset],
  })

  return NextResponse.json(result.rows)
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, action } = await request.json()
    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action required' }, { status: 400 })
    }

    const leadResult = await db.execute({
      sql: 'SELECT business_id, phone, name FROM leads WHERE id = ?',
      args: [id],
    })
    const lead = leadResult.rows[0] as Record<string, unknown> | undefined
    if (!lead) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (action === 'approve') {
      const token = generateClaimToken()
      await db.execute({
        sql: "UPDATE businesses SET claimed = 1, claim_token = ?, claimed_by = ?, updated_at = datetime('now') WHERE id = ?",
        args: [token, lead.phone as string, lead.business_id as number],
      })
      await db.execute({
        sql: "INSERT INTO owner_notifications (owner_phone, business_id, type, message) VALUES (?, ?, 'claim_approved', ?)",
        args: [lead.phone as string, lead.business_id as number, 'Your business claim has been approved! Create your account at /owner/register to manage your listing.'],
      })
    }

    return NextResponse.json({ success: true, action })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
