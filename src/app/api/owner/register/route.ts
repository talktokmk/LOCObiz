import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signOwnerToken } from '@/lib/owner-auth'

export async function POST(request: NextRequest) {
  try {
    const { phone, name, password } = await request.json()
    if (!phone || !name || !password) {
      return NextResponse.json({ error: 'Phone, name, and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    const existing = await db.execute({
      sql: 'SELECT id FROM owners WHERE phone = ?',
      args: [cleanPhone],
    })
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Phone already registered. Please login.' }, { status: 409 })
    }
    const bizResult = await db.execute({
      sql: "SELECT id, name FROM businesses WHERE claimed_by = ? AND claimed = 1",
      args: [cleanPhone],
    })
    if (bizResult.rows.length === 0) {
      return NextResponse.json({ error: 'No claimed business found for this phone. Please claim a business first.' }, { status: 400 })
    }
    const passwordHash = await hashPassword(password)
    await db.execute({
      sql: 'INSERT INTO owners (phone, name, password_hash) VALUES (?, ?, ?)',
      args: [cleanPhone, name, passwordHash],
    })
    const ownerResult = await db.execute({
      sql: 'SELECT id FROM owners WHERE phone = ?',
      args: [cleanPhone],
    })
    const ownerId = (ownerResult.rows[0] as Record<string, unknown>).id as number
    const token = signOwnerToken({ id: ownerId, phone: cleanPhone })
    const response = NextResponse.json({ success: true, businesses: bizResult.rows.length })
    response.cookies.set('owner_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    return response
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
