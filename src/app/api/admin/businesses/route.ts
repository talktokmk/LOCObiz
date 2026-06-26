import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const limit = Math.min(Number(searchParams.get('limit')) || 1000, 5000)
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
      revalidatePath('/', 'layout')
      return NextResponse.json({ success: true, count: result.rowsAffected })
    }

    if (action === 'delete_all') {
      const result = await db.execute({ sql: 'DELETE FROM businesses' })
      revalidatePath('/', 'layout')
      return NextResponse.json({ success: true, count: result.rowsAffected })
    }

    if (action === 'delete_single') {
      const { id } = body
      if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 })
      }
      await db.execute({
        sql: 'DELETE FROM businesses WHERE id = ?',
        args: [Number(id)],
      })
      revalidatePath('/', 'layout')
      return NextResponse.json({ success: true })
    }

    if (action === 'bulk_update_category') {
      const { ids, category_slug } = body
      if (!Array.isArray(ids) || ids.length === 0 || !category_slug) {
        return NextResponse.json({ error: 'ids[] and category_slug required' }, { status: 400 })
      }
      const catResult = await db.execute({
        sql: 'SELECT id FROM categories WHERE slug = ?',
        args: [category_slug],
      })
      if (catResult.rows.length === 0) {
        return NextResponse.json({ error: 'Category not found' }, { status: 400 })
      }
      const catId = (catResult.rows[0] as Record<string, unknown>).id as number
      const placeholders = ids.map(() => '?').join(',')
      await db.execute({
        sql: `UPDATE businesses SET category_id = ?, category_slug = ?, updated_at = datetime('now') WHERE id IN (${placeholders})`,
        args: [catId, category_slug, ...ids],
      })
      revalidatePath('/', 'layout')
      return NextResponse.json({ success: true, count: ids.length })
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
