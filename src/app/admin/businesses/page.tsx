'use client'

import { useEffect, useState } from 'react'
import { Search, Star, CheckCircle, XCircle, ChevronDown, ChevronUp, Clock, ExternalLink } from 'lucide-react'

interface Business {
  id: number
  name: string
  slug: string
  city: string
  district: string
  state: string
  category_slug: string
  rating: number
  verified: number
  featured: number
  views: number
  whatsapp_clicks: number
  phone: string
  status: string
  is_scraped: number
  source: string
  meta_title: string | null
  meta_description: string | null
  created_at: string
}

interface EditState {
  id: number
  meta_title: string
  meta_description: string
}

type StatusFilter = 'all' | 'pending' | 'approved'

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [edits, setEdits] = useState<Record<number, EditState>>({})

  useEffect(() => { fetchBusinesses() }, [])

  async function fetchBusinesses() {
    try {
      const res = await fetch('/api/admin/businesses?limit=5000')
      const data = res.ok ? await res.json() : []
      setBusinesses(data)
      const initEdits: Record<number, EditState> = {}
      for (const b of data) {
        initEdits[b.id] = { id: b.id, meta_title: b.meta_title || '', meta_description: b.meta_description || '' }
      }
      setEdits(initEdits)
    } finally { setLoading(false) }
  }

  async function updateStatus(id: number, status: string) {
    await fetch('/api/admin/businesses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    fetchBusinesses()
  }

  async function bulkApprove() {
    if (!confirm(`Approve all ${pendingCount} pending businesses?`)) return
    await fetch('/api/admin/businesses', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve_all' }) })
    fetchBusinesses()
  }

  async function deleteAll() {
    if (!confirm('DELETE ALL businesses? This cannot be undone. Type "yes" to confirm.') || prompt('Type "yes" to confirm deleting ALL businesses:') !== 'yes') return
    await fetch('/api/admin/businesses', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_all' }) })
    fetchBusinesses()
  }

  async function toggleFeatured(id: number, current: number) {
    await fetch('/api/admin/businesses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, featured: current ? 0 : 1 }) })
    fetchBusinesses()
  }

  async function toggleVerified(id: number, current: number) {
    await fetch('/api/admin/businesses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, verified: current ? 0 : 1 }) })
    fetchBusinesses()
  }

  async function deleteBusiness(id: number) {
    if (!confirm('Are you sure?')) return
    await fetch('/api/admin/businesses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_single', id }),
    })
    fetchBusinesses()
  }

  async function saveSeo(id: number) {
    const e = edits[id]
    if (!e) return
    await fetch('/api/admin/businesses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, meta_title: e.meta_title || null, meta_description: e.meta_description || null }),
    })
    fetchBusinesses()
  }

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const pendingCount = businesses.filter((b) => b.status === 'pending').length

  const filtered = businesses.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    const q = search.toLowerCase()
    return !q || b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) ||
      (b.district && b.district.toLowerCase().includes(q)) ||
      (b.state && b.state.toLowerCase().includes(q))
  })

  if (loading) return <p className="text-surface-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Businesses ({businesses.length})</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, city, district, state..."
            className="pl-9 pr-4 py-2 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40 w-64" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved'] as const).map((tab) => (
            <button key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === tab
                ? 'bg-whatsapp text-white'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>
              {tab === 'all' ? 'All' : tab === 'pending' ? `Pending (${pendingCount})` : 'Approved'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button onClick={bulkApprove}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
              <CheckCircle className="w-4 h-4" /> Bulk Approve All ({pendingCount})
            </button>
          )}
          <button onClick={deleteAll}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
            Delete All Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-3 font-medium text-surface-600">Name / SEO</th>
                <th className="text-left px-4 py-3 font-medium text-surface-600">City</th>
                <th className="text-left px-4 py-3 font-medium text-surface-600">State</th>
                <th className="text-left px-4 py-3 font-medium text-surface-600">Category</th>
                <th className="text-center px-4 py-3 font-medium text-surface-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-surface-600">Rating</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Source</th>
                  <th className="text-center px-4 py-3 font-medium text-surface-600">WA Clicks</th>
                <th className="text-center px-4 py-3 font-medium text-surface-600">Views</th>
                <th className="text-center px-4 py-3 font-medium text-surface-600">Featured</th>
                <th className="text-center px-4 py-3 font-medium text-surface-600">Verified</th>
                <th className="text-right px-4 py-3 font-medium text-surface-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((biz) => {
                const isOpen = expanded.has(biz.id)
                const edit = edits[biz.id]
                return (
                  <tr key={biz.id} className={`border-b border-surface-100 hover:bg-surface-50 ${biz.status === 'pending' ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleExpand(biz.id)} className="flex items-center gap-1.5 font-medium text-surface-900 hover:text-whatsapp-dark transition-colors">
                        {biz.name}
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-surface-400" /> : <ChevronDown className="w-3.5 h-3.5 text-surface-400" />}
                      </button>
                      {biz.meta_title && <div className="text-[11px] text-surface-400 mt-0.5 truncate max-w-[250px]">SEO: {biz.meta_title}</div>}
                      {isOpen && edit && (
                        <div className="mt-2 pt-2 border-t border-surface-100 space-y-2">
                          <div>
                            <label className="text-[11px] font-medium text-surface-500 block mb-0.5">Meta Title</label>
                            <input type="text" value={edit.meta_title}
                              onChange={(e) => setEdits({ ...edits, [biz.id]: { ...edit, meta_title: e.target.value } })}
                              className="w-full px-2 py-1.5 rounded border border-surface-200 text-xs focus:outline-none focus:ring-1 focus:ring-whatsapp/40" />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-surface-500 block mb-0.5">Meta Description</label>
                            <input type="text" value={edit.meta_description}
                              onChange={(e) => setEdits({ ...edits, [biz.id]: { ...edit, meta_description: e.target.value } })}
                              className="w-full px-2 py-1.5 rounded border border-surface-200 text-xs focus:outline-none focus:ring-1 focus:ring-whatsapp/40" />
                          </div>
                          <button onClick={() => saveSeo(biz.id)}
                            className="px-3 py-1 bg-whatsapp text-white text-[11px] font-medium rounded-lg hover:bg-whatsapp-dark transition-colors">
                            Save SEO
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-surface-600">{biz.city}</td>
                    <td className="px-4 py-3 text-surface-600 capitalize">{biz.state?.replace(/-/g, ' ') || '-'}</td>
                    <td className="px-4 py-3 text-surface-600 capitalize">{biz.category_slug}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${biz.is_scraped ? 'bg-green-50 text-green-700' : 'bg-surface-100 text-surface-600'}`}>
                        {biz.source || (biz.is_scraped ? 'scraped' : 'manual')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {biz.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{biz.rating}</div></td>
                    <td className="px-4 py-3 text-center text-surface-600">{biz.whatsapp_clicks ?? 0}</td>
                    <td className="px-4 py-3 text-center text-surface-600">{biz.views}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleFeatured(biz.id, biz.featured)}>
                        {biz.featured ? <CheckCircle className="w-5 h-5 text-whatsapp" /> : <XCircle className="w-5 h-5 text-surface-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleVerified(biz.id, biz.verified)}>
                        {biz.verified ? <CheckCircle className="w-5 h-5 text-brand-600" /> : <XCircle className="w-5 h-5 text-surface-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {biz.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(biz.id, 'approved')}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => deleteBusiness(biz.id)}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                        <a href={`/business/${biz.slug}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="View live page">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button onClick={() => deleteBusiness(biz.id)} className="text-red-500 hover:text-red-700 text-xs font-medium ml-1">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
