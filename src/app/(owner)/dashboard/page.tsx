'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, MessageCircle, TrendingUp, Star, Users, ExternalLink, Edit3, ArrowRight } from 'lucide-react'

interface Analytics {
  business: { name: string; slug: string }
  views: number
  weeklyViews: number
  whatsappClicks: number
  leads: number
  rating: number
  reviews: number
}

export default function OwnerDashboardPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/owner/analytics')
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-surface-500">Loading...</p>
  if (!data) return <p className="text-red-500">Failed to load analytics</p>

  const stats = [
    { label: 'Total Views', value: data.views, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Weekly Views', value: data.weeklyViews, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'WA Clicks', value: data.whatsappClicks, icon: MessageCircle, color: 'text-whatsapp', bg: 'bg-whatsapp/10' },
    { label: 'Leads', value: data.leads, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Rating', value: data.rating, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', suffix: `/5 (${data.reviews} reviews)` },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-0.5">{data.business.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/business/${data.business.slug}`} target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-surface-200 text-surface-700 text-sm font-medium rounded-xl hover:bg-surface-50 transition-colors">
            <ExternalLink className="w-4 h-4" /> View Listing
          </Link>
          <Link href="/dashboard/edit"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-whatsapp text-white text-sm font-medium rounded-xl hover:bg-whatsapp-dark transition-colors">
            <Edit3 className="w-4 h-4" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-surface-200 p-4">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-surface-900">{s.value}</div>
              <div className="text-xs text-surface-500 mt-0.5">{s.label}</div>
              {s.suffix && <div className="text-[11px] text-surface-400">{s.suffix}</div>}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/edit" className="bg-white rounded-xl border border-surface-200 p-5 hover:border-whatsapp/30 transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <Edit3 className="w-5 h-5 text-whatsapp" />
            <h3 className="font-semibold text-surface-900">Edit Business Info</h3>
          </div>
          <p className="text-sm text-surface-500">Update your name, description, phone, address, and more.</p>
          <span className="text-xs text-whatsapp font-medium mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Manage <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
        <Link href="/dashboard/leads" className="bg-white rounded-xl border border-surface-200 p-5 hover:border-whatsapp/30 transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 text-whatsapp" />
            <h3 className="font-semibold text-surface-900">Leads ({data.leads})</h3>
          </div>
          <p className="text-sm text-surface-500">View all WhatsApp leads and customer inquiries.</p>
          <span className="text-xs text-whatsapp font-medium mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            View All <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  )
}
