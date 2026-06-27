import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOwnerSession } from '@/lib/owner-auth'
import { revalidatePath } from 'next/cache'

async function getOwnedBusinessId(session: { phone: string }): Promise<number | null> {
  const result = await db.execute({
    sql: "SELECT id FROM businesses WHERE claimed_by = ? AND claimed = 1 LIMIT 1",
    args: [session.phone],
  })
  if (result.rows.length === 0) return null
  return (result.rows[0] as Record<string, unknown>).id as number
}

export async function GET() {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getOwnedBusinessId(session)
  if (!businessId) return NextResponse.json({ error: 'No claimed business' }, { status: 404 })

  const result = await db.execute({
    sql: 'SELECT id, name, slug, keywords FROM business_services WHERE business_id = ? ORDER BY name',
    args: [businessId],
  })
  return NextResponse.json(result.rows)
}

export async function POST(request: NextRequest) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getOwnedBusinessId(session)
  if (!businessId) return NextResponse.json({ error: 'No claimed business' }, { status: 404 })

  try {
    const { name, keywords } = await request.json()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const result = await db.execute({
      sql: "INSERT INTO business_services (business_id, name, slug, keywords) VALUES (?, ?, ?, ?)",
      args: [businessId, name, slug, keywords || ''],
    })
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getOwnedBusinessId(session)
  if (!businessId) return NextResponse.json({ error: 'No claimed business' }, { status: 404 })

  try {
    const { id, name, keywords } = await request.json()
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const updates: string[] = []
    const args: (string | number)[] = []

    if (name) {
      updates.push('name = ?')
      args.push(name)
      updates.push('slug = ?')
      args.push(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
    if (keywords !== undefined) {
      updates.push('keywords = ?')
      args.push(keywords)
    }
    if (updates.length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 })

    args.push(id, businessId)
    await db.execute({
      sql: `UPDATE business_services SET ${updates.join(', ')} WHERE id = ? AND business_id = ?`,
      args,
    })
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getOwnedBusinessId(session)
  if (!businessId) return NextResponse.json({ error: 'No claimed business' }, { status: 404 })

  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await db.execute({
    sql: 'DELETE FROM business_services WHERE id = ? AND business_id = ?',
    args: [Number(id), businessId],
  })
  revalidatePath('/', 'layout')
  return NextResponse.json({ success: true })
}
