import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tag } = await request.json()
  if (!tag) {
    return NextResponse.json({ error: 'Tag required' }, { status: 400 })
  }

  revalidateTag(tag, 'max')
  return NextResponse.json({ success: true, revalidated: true })
}
