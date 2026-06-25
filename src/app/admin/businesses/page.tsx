'use client'

import { useEffect, useState } from 'react'
import { Search, Star, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

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
  phone: string
  meta_title: string | null
  meta_description: string | null
  created_at: string
}

interface EditState {
  id: number
  meta_title: string
  meta_description: string
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [edits, setEdits] = useState<Record<number, EditState>>({})

  useEffect(() => { fetchBusinesses() }, [])

  async function fetchBusinesses() {
    try {
      const res = await fetch('/api/admin/businesses')
      const data = res.ok ? await res.json() : []
      setBusinesses(data)
      const initEdits: Record<number, EditState> = {}
      for (const b of data) {
        initEdits[b.id] = { id: b.id, meta_title: b.meta_title || '', meta_description: b.meta_description || '' }
      }
      setEdits(initEdits)
    } finally { setLoading(false) }
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
    await fetch(`/api/admin/businesses?id=${id}`, { method: 'DELETE' })
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

  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    (b.district && b.district.toLowerCase().includes(search.toLowerCase())) ||
    (b.state && b.state.toLowerCase().includes(search.toLowerCase()))
  )

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

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-3 font-medium text-surface-600">Name / SEO</th>
                <th className="text-left px-4 py-3 font-medium text-surface-600">City</th>
                <th className="text-left px-4 py-3 font-medium text-surface-600">State</th>
                <th className="text-left px-4 py-3 font-medium text-surface-600">Category</th>
                <th className="text-center px-4 py-3 font-medium text-surface-600">Rating</th>
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
                  <tr key={biz.id} className="border-b border-surface-100 hover:bg-surface-50">
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
                    <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{biz.rating}</div></td>
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
                      <button onClick={() => deleteBusiness(biz.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
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
