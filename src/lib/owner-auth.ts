import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is required.')
  return secret
})()

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signOwnerToken(payload: { id: number; phone: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyOwnerToken(token: string): { id: number; phone: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; phone: string }
  } catch {
    return null
  }
}

export async function getOwnerSession(): Promise<{ id: number; phone: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('owner_token')?.value
  if (!token) return null
  return verifyOwnerToken(token)
}
