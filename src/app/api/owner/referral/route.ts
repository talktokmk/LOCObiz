import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOwnerSession } from '@/lib/owner-auth'
import crypto from 'crypto'

export async function GET() {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bizResult = await db.execute({
    sql: "SELECT id, name, slug, referral_code FROM businesses WHERE claimed_by = ? AND claimed = 1 LIMIT 1",
    args: [session.phone],
  })
  const biz = bizResult.rows[0] as unknown as { id: number; name: string; slug: string; referral_code: string | null } | undefined
  if (!biz) return NextResponse.json({ error: 'No claimed business found' }, { status: 404 })

  let code = biz.referral_code
  if (!code) {
    code = crypto.randomBytes(4).toString('hex')
    await db.execute({
      sql: "UPDATE businesses SET referral_code = ? WHERE id = ?",
      args: [code, biz.id],
    })
  }

  const referralUrl = `https://adzbe.cloud/business/${biz.slug}?ref=${code}`

  const clicksResult = await db.execute({
    sql: "SELECT COUNT(*) as count FROM page_views WHERE page_url LIKE ? AND referrer LIKE ?",
    args: [`%/business/${biz.slug}%`, `%ref=${code}%`],
  })
  const clicks = Number((clicksResult.rows[0] as Record<string, unknown>).count)

  return NextResponse.json({
    referral_code: code,
    referral_url: referralUrl,
    clicks,
  })
}

export async function POST() {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bizResult = await db.execute({
    sql: "SELECT id, slug, referral_code FROM businesses WHERE claimed_by = ? AND claimed = 1 LIMIT 1",
    args: [session.phone],
  })
  const biz = bizResult.rows[0] as unknown as { id: number; slug: string; referral_code: string | null } | undefined
  if (!biz) return NextResponse.json({ error: 'No claimed business found' }, { status: 404 })

  const code = crypto.randomBytes(4).toString('hex')
  await db.execute({
    sql: "UPDATE businesses SET referral_code = ? WHERE id = ?",
    args: [code, biz.id],
  })

  const referralUrl = `https://adzbe.cloud/business/${biz.slug}?ref=${code}`
  return NextResponse.json({ referral_code: code, referral_url: referralUrl })
}