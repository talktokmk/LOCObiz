import { db } from '@/lib/db'
import { Store, MessageSquare, Eye, Building2, FileText, MessageCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getStats() {
  const [totalBiz, totalLeads, totalViews, totalCities, totalClaims, totalWaClicks, pendingBiz] = await Promise.all([
    db.execute('SELECT COUNT(*) as count FROM businesses'),
    db.execute('SELECT COUNT(*) as count FROM leads'),
    db.execute('SELECT COALESCE(SUM(views), 0) as count FROM businesses'),
    db.execute('SELECT COUNT(DISTINCT city) as count FROM businesses'),
    db.execute("SELECT COUNT(*) as count FROM leads WHERE source = 'claim'"),
    db.execute('SELECT COALESCE(SUM(whatsapp_clicks), 0) as count FROM businesses'),
    db.execute("SELECT COUNT(*) as count FROM businesses WHERE status = 'pending'"),
  ])

  return {
    totalBusinesses: Number((totalBiz.rows[0] as Record<string, unknown>).count),
    totalLeads: Number((totalLeads.rows[0] as Record<string, unknown>).count),
    totalViews: Number((totalViews.rows[0] as Record<string, unknown>).count),
    totalCities: Number((totalCities.rows[0] as Record<string, unknown>).count),
    totalClaims: Number((totalClaims.rows[0] as Record<string, unknown>).count),
    totalWaClicks: Number((totalWaClicks.rows[0] as Record<string, unknown>).count),
    pendingBusinesses: Number((pendingBiz.rows[0] as Record<string, unknown>).count),
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Businesses', value: stats.totalBusinesses, icon: Store, color: 'text-brand-600 bg-brand-100' },
    { label: 'Pending Approval', value: stats.pendingBusinesses, icon: Clock, color: 'text-amber-600 bg-amber-100' },
    { label: 'Total Leads', value: stats.totalLeads, icon: MessageSquare, color: 'text-green-600 bg-green-100' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-amber-600 bg-amber-100' },
    { label: 'WA Clicks', value: stats.totalWaClicks, icon: MessageCircle, color: 'text-whatsapp bg-whatsapp/10' },
    { label: 'Cities Covered', value: stats.totalCities, icon: Building2, color: 'text-purple-600 bg-purple-100' },
    { label: 'Claim Requests', value: stats.totalClaims, icon: FileText, color: 'text-rose-600 bg-rose-100' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-surface-200 p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-surface-900">{card.value}</p>
              <p className="text-sm text-surface-500">{card.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
