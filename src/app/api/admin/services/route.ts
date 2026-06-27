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
  const businessId = searchParams.get('business_id')

  if (businessId) {
    const result = await db.execute({
      sql: 'SELECT * FROM business_services WHERE business_id = ? ORDER BY name',
      args: [Number(businessId)],
    })
    return NextResponse.json(result.rows)
  }

  const limit = Math.min(Number(searchParams.get('limit')) || 1000, 5000)
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

  const countResult = await db.execute('SELECT COUNT(*) as total FROM business_services')
  const total = (countResult.rows[0] as unknown as { total: number }).total

  const result = await db.execute({
    sql: `SELECT bs.*, b.name as business_name, b.slug as business_slug, b.city
      FROM business_services bs
      LEFT JOIN businesses b ON b.id = bs.business_id
      ORDER BY bs.id DESC LIMIT ? OFFSET ?`,
    args: [limit, offset],
  })

  return NextResponse.json({ services: result.rows, total })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { business_id, name, keywords } = body

    if (!business_id || !name) {
      return NextResponse.json({ error: 'business_id and name required' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const result = await db.execute({
      sql: "INSERT INTO business_services (business_id, name, slug, keywords) VALUES (?, ?, ?, ?)",
      args: [business_id, name, slug, keywords || ''],
    })

    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, name, keywords } = body

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const updates: string[] = []
    const args: (string | number)[] = []

    if (name) {
      updates.push('name = ?')
      args.push(name)
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      updates.push('slug = ?')
      args.push(slug)
    }
    if (keywords !== undefined) {
      updates.push('keywords = ?')
      args.push(keywords)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    args.push(id)
    await db.execute({
      sql: `UPDATE business_services SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
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
    sql: 'DELETE FROM business_services WHERE id = ?',
    args: [Number(id)],
  })

  revalidatePath('/', 'layout')
  return NextResponse.json({ success: true })
}
