'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

interface Claim {
  id: number
  business_id: number
  business_name: string
  business_slug: string
  name: string
  phone: string
  message: string
  created_at: string
  claimed: number
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/claims')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setClaims(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-surface-500">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Claim Requests</h1>
      {claims.length === 0 ? (
        <p className="text-surface-500">No claim requests yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Claimant</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="px-4 py-3 font-medium text-surface-900">{claim.business_name || `#${claim.business_id}`}</td>
                    <td className="px-4 py-3 text-surface-600">{claim.name || '-'}</td>
                    <td className="px-4 py-3 text-surface-600">{claim.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${claim.claimed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {claim.claimed ? 'Claimed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-500 whitespace-nowrap">{formatDate(claim.created_at)}</td>
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
