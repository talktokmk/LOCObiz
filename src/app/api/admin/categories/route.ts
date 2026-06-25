import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM categories ORDER BY name')
    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, slug, description } = await request.json()
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }
    await db.execute({
      sql: 'INSERT INTO categories (slug, name, description) VALUES (?, ?, ?)',
      args: [slug.toLowerCase().replace(/\s+/g, '-'), name, description || null],
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, slug, description } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await db.execute({
      sql: 'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
      args: [name, slug?.toLowerCase().replace(/\s+/g, '-'), description || null, id],
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
