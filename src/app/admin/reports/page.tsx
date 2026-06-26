'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Flag, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface Report {
  id: number
  business_id: number
  reporter_name: string
  reporter_phone: string
  reason: string
  details: string
  status: string
  created_at: string
  business_name: string
  business_slug: string
  city: string
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    try {
      const res = await fetch('/api/admin/reports')
      const data = res.ok ? await res.json() : []
      setReports(data)
    } finally { setLoading(false) }
  }

  async function updateStatus(id: number, status: string) {
    await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchReports()
  }

  if (loading) return <p className="text-surface-500">Loading...</p>

  const pending = reports.filter(r => r.status === 'pending')
  const resolved = reports.filter(r => r.status !== 'pending')

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6 flex items-center gap-2">
        <Flag className="w-6 h-6" /> Reports ({reports.length})
      </h1>

      {reports.length === 0 ? (
        <p className="text-surface-400 text-center py-12">No reports yet.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((r) => <ReportCard key={r.id} report={r} onAction={updateStatus} />)}
          {resolved.map((r) => <ReportCard key={r.id} report={r} onAction={updateStatus} />)}
        </div>
      )}
    </div>
  )
}

function ReportCard({ report, onAction }: { report: Report; onAction: (id: number, status: string) => void }) {
  const isPending = report.status === 'pending'
  return (
    <div className={`bg-white rounded-xl border p-5 ${isPending ? 'border-amber-200 ring-1 ring-amber-100' : 'border-surface-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/business/${report.business_slug}`} target="_blank"
              className="font-semibold text-surface-900 hover:text-whatsapp-dark transition-colors flex items-center gap-1">
              {report.business_name || `Business #${report.business_id}`}
              <ExternalLink className="w-3 h-3 text-surface-400" />
            </Link>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isPending ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}>
              {isPending ? 'Pending' : 'Resolved'}
            </span>
          </div>
          <p className="text-sm text-surface-700 font-medium capitalize">{report.reason.replace(/_/g, ' ')}</p>
          {report.details && <p className="text-sm text-surface-500 mt-1">{report.details}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
            <span>{report.city || 'N/A'}</span>
            {report.reporter_phone && <span>Reporter: {report.reporter_phone}</span>}
            <span>{new Date(report.created_at).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
        {isPending && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onAction(report.id, 'resolved')}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark resolved">
              <CheckCircle className="w-5 h-5" />
            </button>
            <button onClick={() => onAction(report.id, 'dismissed')}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Dismiss">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}