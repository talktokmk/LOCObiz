'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

interface Lead {
  id: number
  business_id: number
  business_name: string
  business_slug: string
  name: string
  phone: string
  message: string
  source: string
  created_at: string
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/leads')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setLeads(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-surface-500">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Leads</h1>
      {leads.length === 0 ? (
        <p className="text-surface-500">No leads yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="px-4 py-3 font-medium text-surface-900">{lead.business_name || `#${lead.business_id}`}</td>
                    <td className="px-4 py-3 text-surface-600">{lead.name || '-'}</td>
                    <td className="px-4 py-3 text-surface-600">{lead.phone}</td>
                    <td className="px-4 py-3 text-surface-600 max-w-xs truncate">{lead.message || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-surface-100 text-surface-600 rounded text-xs font-medium">{lead.source}</span>
                    </td>
                    <td className="px-4 py-3 text-surface-500 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
