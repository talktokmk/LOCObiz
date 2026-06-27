'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, Trash2, ExternalLink, ChevronDown, ChevronUp, Save, X } from 'lucide-react'

interface Service {
  id: number
  business_id: number
  name: string
  slug: string
  keywords: string
  business_name: string
  business_slug: string
  city: string
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [showAdd, setShowAdd] = useState(false)
  const [addBusinessId, setAddBusinessId] = useState('')
  const [addName, setAddName] = useState('')
  const [addKeywords, setAddKeywords] = useState('')
  const [editKeywords, setEditKeywords] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<Set<number>>(new Set())
  const [addSaving, setAddSaving] = useState(false)
  const [businesses, setBusinesses] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/services').then(r => r.ok ? r.json() : { services: [] }),
      fetch('/api/admin/businesses?limit=5000').then(r => r.ok ? r.json() : []),
    ]).then(([servicesData, bizData]) => {
      setServices(servicesData.services || [])
      setBusinesses(bizData)
      const init: Record<number, string> = {}
      for (const s of servicesData.services || []) {
        init[s.id] = s.keywords || ''
      }
      setEditKeywords(init)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleAdd() {
    if (!addBusinessId || !addName) return
    setAddSaving(true)
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: Number(addBusinessId), name: addName, keywords: addKeywords }),
      })
      if (res.ok) {
        const data = await res.json()
        setServices(prev => [...prev, { id: data.id, business_id: Number(addBusinessId), name: addName, slug: '', keywords: addKeywords, business_name: '', business_slug: '', city: '' }])
        setShowAdd(false)
        setAddName('')
        setAddKeywords('')
        setAddBusinessId('')
      }
    } finally { setAddSaving(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' })
    setServices(prev => prev.filter(s => s.id !== id))
  }

  async function saveKeywords(id: number) {
    setSaving(prev => new Set(prev).add(id))
    try {
      await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, keywords: editKeywords[id] || '' }),
      })
    } finally {
      setSaving(prev => { const n = new Set(prev); n.delete(id); return n })
    }
  }

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const filtered = services.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name.toLowerCase().includes(q) ||
      (s.business_name && s.business_name.toLowerCase().includes(q)) ||
      (s.keywords && s.keywords.toLowerCase().includes(q))
  })

  if (loading) return <p className="text-surface-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Services ({services.length})</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-9 pr-4 py-2 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40 w-64" />
          </div>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-whatsapp text-white text-sm font-medium rounded-xl hover:bg-whatsapp-dark transition-colors">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-surface-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-surface-900">Add New Service</h2>
            <button onClick={() => setShowAdd(false)} className="text-surface-400 hover:text-surface-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Business</label>
              <select value={addBusinessId} onChange={(e) => setAddBusinessId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40">
                <option value="">Select business...</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Service Name</label>
              <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
                placeholder="e.g. Haircut" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Keywords (comma-separated)</label>
              <input type="text" value={addKeywords} onChange={(e) => setAddKeywords(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
                placeholder="e.g. haircut, hair styling, barber" />
            </div>
          </div>
          <div className="mt-4">
            <button onClick={handleAdd} disabled={addSaving || !addBusinessId || !addName}
              className="px-4 py-2 bg-whatsapp text-white text-sm font-medium rounded-xl hover:bg-whatsapp-dark transition-colors disabled:opacity-50">
              {addSaving ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              <th className="text-left px-4 py-3 font-medium text-surface-600">Service</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Business</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">City</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Keywords</th>
              <th className="text-right px-4 py-3 font-medium text-surface-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((svc) => {
              const isOpen = expanded.has(svc.id)
              return (
                <tr key={svc.id} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleExpand(svc.id)} className="flex items-center gap-1.5 font-medium text-surface-900">
                      {svc.name}
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-surface-400" /> : <ChevronDown className="w-3.5 h-3.5 text-surface-400" />}
                    </button>
                    <div className="text-[11px] text-surface-400">/{svc.slug}</div>
                    {isOpen && (
                      <div className="mt-2 pt-2 border-t border-surface-100">
                        <label className="text-[11px] font-medium text-surface-500 block mb-1">Ranking Keywords (comma-separated)</label>
                        <div className="flex items-center gap-2">
                          <input type="text" value={editKeywords[svc.id] || ''}
                            onChange={(e) => setEditKeywords({ ...editKeywords, [svc.id]: e.target.value })}
                            className="flex-1 px-2 py-1.5 rounded border border-surface-200 text-xs focus:outline-none focus:ring-1 focus:ring-whatsapp/40"
                            placeholder="e.g. haircut, hair styling, barber" />
                          <button onClick={() => saveKeywords(svc.id)} disabled={saving.has(svc.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-whatsapp text-white text-xs font-medium rounded-lg hover:bg-whatsapp-dark transition-colors disabled:opacity-50">
                            <Save className="w-3 h-3" /> {saving.has(svc.id) ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-surface-600">{svc.business_name || `Business #${svc.business_id}`}</div>
                    {svc.business_slug && (
                      <a href={`/business/${svc.business_slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-brand-600 hover:underline inline-flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-surface-600">{svc.city || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-surface-400">{svc.keywords || 'No keywords set'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(svc.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium inline-flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-surface-400 text-sm">No services found</div>
        )}
      </div>
    </div>
  )
}
