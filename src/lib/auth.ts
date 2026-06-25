import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'locobiz-dev-secret-change-in-production'
const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: { id: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string }
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ id: number; username: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function authenticateAdmin(username: string, password: string): Promise<string | null> {
  const rows = await db.execute({
    sql: 'SELECT * FROM admins WHERE username = ?',
    args: [username],
  })
  if (rows.rows.length === 0) return null
  const admin = rows.rows[0] as unknown as { id: number; username: string; password_hash: string }
  const valid = await verifyPassword(password, admin.password_hash)
  if (!valid) return null
  return signToken({ id: admin.id, username: admin.username })
}
