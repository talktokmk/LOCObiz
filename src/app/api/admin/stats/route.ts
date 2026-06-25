import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [totalBiz, totalLeads, totalViews, totalCities, totalClaims] = await Promise.all([
    db.execute('SELECT COUNT(*) as count FROM businesses'),
    db.execute('SELECT COUNT(*) as count FROM leads'),
    db.execute('SELECT COALESCE(SUM(views), 0) as count FROM businesses'),
    db.execute('SELECT COUNT(DISTINCT city) as count FROM businesses'),
    db.execute("SELECT COUNT(*) as count FROM leads WHERE source = 'claim'"),
  ])

  return NextResponse.json({
    totalBusinesses: Number((totalBiz.rows[0] as Record<string, unknown>).count),
    totalLeads: Number((totalLeads.rows[0] as Record<string, unknown>).count),
    totalViews: Number((totalViews.rows[0] as Record<string, unknown>).count),
    totalCities: Number((totalCities.rows[0] as Record<string, unknown>).count),
    totalClaims: Number((totalClaims.rows[0] as Record<string, unknown>).count),
  })
}
