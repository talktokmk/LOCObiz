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
    sql: 'SELECT * FROM businesses ORDER BY created_at DESC LIMIT ? OFFSET ?',
    args: [limit, offset],
  })

  return NextResponse.json(result.rows)
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const allowedFields = ['name', 'phone', 'email', 'website', 'whatsapp', 'description',
      'services', 'price_range', 'opening_hours', 'featured', 'verified', 'rating', 'address', 'area',
      'meta_title', 'meta_description', 'status']
    const updates: string[] = []
    const args: (string | number)[] = []

    for (const field of allowedFields) {
      if (field in fields) {
        updates.push(`${field} = ?`)
        args.push(fields[field])
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updates.push("updated_at = datetime('now')")
    args.push(id)

    await db.execute({
      sql: `UPDATE businesses SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'approve_all') {
      const result = await db.execute({
        sql: "UPDATE businesses SET status = 'approved', updated_at = datetime('now') WHERE status = 'pending'",
      })
      return NextResponse.json({ success: true, count: result.rowsAffected })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  await db.execute({
    sql: 'DELETE FROM businesses WHERE id = ?',
    args: [Number(id)],
  })

  return NextResponse.json({ success: true })
}
