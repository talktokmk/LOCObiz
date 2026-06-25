import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Ranking is now real-time — businesses are sorted by featured, WhatsApp clicks, rating, and reviews.',
  })
}
