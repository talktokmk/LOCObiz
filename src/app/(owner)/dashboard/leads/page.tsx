'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Phone, Calendar } from 'lucide-react'

interface Lead {
  id: number
  name: string
  phone: string
  message: string
  source: string
  created_at: string
}

export default function OwnerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/owner/leads')
      .then((r) => r.ok ? r.json() : [])
      .then(setLeads)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-surface-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="p-2 hover:bg-surface-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-surface-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Leads</h1>
          <p className="text-surface-500 text-sm">Customer inquiries from your listing</p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center">
          <MessageCircle className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-surface-600">No leads yet</h2>
          <p className="text-surface-400 text-sm mt-1">Leads will appear here when customers contact you via WhatsApp.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl border border-surface-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold text-surface-900">{lead.name || 'Anonymous'}</span>
                  <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-whatsapp hover:underline mt-0.5">
                    <Phone className="w-3.5 h-3.5" /> {lead.phone}
                  </a>
                </div>
                <span className="flex items-center gap-1 text-xs text-surface-400">
                  <Calendar className="w-3 h-3" /> {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {lead.message && (
                <p className="text-sm text-surface-600 bg-surface-50 rounded-lg p-3 mt-2">{lead.message}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] bg-whatsapp/10 text-whatsapp-dark px-2 py-0.5 rounded-full font-medium">
                  {lead.source === 'wa.me' ? 'WhatsApp' : lead.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
