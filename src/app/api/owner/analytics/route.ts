import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOwnerSession } from '@/lib/owner-auth'

export async function GET() {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const bizResult = await db.execute({
    sql: "SELECT id, name, slug, views, whatsapp_clicks, rating, reviews_count FROM businesses WHERE claimed_by = ? AND claimed = 1",
    args: [session.phone],
  })
  if (bizResult.rows.length === 0) {
    return NextResponse.json({ error: 'No claimed business found' }, { status: 404 })
  }
  const biz = bizResult.rows[0] as unknown as { id: number; name: string; slug: string; views: number; whatsapp_clicks: number; rating: number; reviews_count: number }
  const leadsResult = await db.execute({
    sql: "SELECT COUNT(*) as count FROM leads WHERE business_id = ?",
    args: [biz.id],
  })
  const leadsCount = (leadsResult.rows[0] as unknown as { count: number }).count
  const recentViews = await db.execute({
    sql: "SELECT COUNT(*) as count FROM page_views WHERE business_id = ? AND created_at >= datetime('now', '-7 days')",
    args: [biz.id],
  })
  const weeklyViews = (recentViews.rows[0] as unknown as { count: number }).count
  return NextResponse.json({
    business: { name: biz.name, slug: biz.slug },
    views: biz.views,
    weeklyViews,
    whatsappClicks: biz.whatsapp_clicks ?? 0,
    leads: leadsCount,
    rating: biz.rating,
    reviews: biz.reviews_count,
  })
}
