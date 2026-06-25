import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Seed endpoint is disabled in production. Use real data imports via /api/admin/import or /api/admin/extension-import.' },
    { status: 403 }
  )
}
