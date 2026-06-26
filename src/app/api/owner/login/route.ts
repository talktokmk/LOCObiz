import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, signOwnerToken } from '@/lib/owner-auth'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()
    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const result = await db.execute({
      sql: 'SELECT id, phone, password_hash FROM owners WHERE phone = ?',
      args: [cleanPhone],
    })
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 })
    }
    const owner = result.rows[0] as unknown as { id: number; phone: string; password_hash: string }
    const valid = await verifyPassword(password, owner.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 })
    }
    const token = signOwnerToken({ id: owner.id, phone: owner.phone })
    const response = NextResponse.json({ success: true })
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
