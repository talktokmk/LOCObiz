'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Plus, Trash2, ExternalLink, Wrench } from 'lucide-react'
import Link from 'next/link'

interface Business {
  id: number
  name: string
  description: string
  services: string
  phone: string
  whatsapp: string
  email: string
  website: string
  address: string
  area: string
  city: string
  district: string
  state: string
  price_range: string
  opening_hours: string
  image_url: string
}

interface OwnerService {
  id: number
  name: string
  slug: string
  keywords: string
}

export default function EditBusinessPage() {
  const router = useRouter()
  const [biz, setBiz] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [svcs, setSvcs] = useState<OwnerService[]>([])
  const [newSvc, setNewSvc] = useState('')
  const [newKw, setNewKw] = useState('')
  const [editKw, setEditKw] = useState<Record<number, string>>({})
  const [svcSaving, setSvcSaving] = useState<Set<number>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch('/api/owner/business').then(r => r.ok ? r.json() : null),
      fetch('/api/owner/services').then(r => r.ok ? r.json() : []),
    ]).then(([bizData, svcData]) => {
      if (bizData?.length > 0) {
        setBiz(bizData[0])
        setSvcs(svcData)
        const init: Record<number, string> = {}
        for (const s of svcData) init[s.id] = s.keywords || ''
        setEditKw(init)
      } else {
        router.push('/dashboard')
      }
    }).finally(() => setLoading(false))
  }, [router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!biz) return
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/owner/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(biz),
      })
      if (res.ok) setMessage('Saved successfully!')
      else { const data = await res.json(); throw new Error(data.error || 'Save failed') }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  async function addService() {
    if (!newSvc.trim()) return
    const res = await fetch('/api/owner/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSvc.trim(), keywords: newKw.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setSvcs(prev => [...prev, { id: data.id, name: newSvc.trim(), slug: '', keywords: newKw.trim() }])
      setEditKw(prev => ({ ...prev, [data.id]: newKw.trim() }))
      setNewSvc('')
      setNewKw('')
    }
  }

  async function deleteService(id: number) {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/owner/services?id=${id}`, { method: 'DELETE' })
    setSvcs(prev => prev.filter(s => s.id !== id))
  }

  async function saveKeywords(id: number) {
    setSvcSaving(prev => new Set(prev).add(id))
    await fetch('/api/owner/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, keywords: editKw[id] || '' }),
    })
    setSvcSaving(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  if (loading) return <p className="text-surface-500">Loading...</p>
  if (!biz) return <p className="text-red-500">No business found</p>

  const fields: { key: keyof Business; label: string; type: string; placeholder: string }[] = [
    { key: 'name', label: 'Business Name', type: 'text', placeholder: 'Your business name' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe your business' },
    { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 9876543210' },
    { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', placeholder: '+91 9876543210' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { key: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com' },
    { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Full address' },
    { key: 'area', label: 'Area', type: 'text', placeholder: 'e.g. Indiranagar' },
    { key: 'city', label: 'City', type: 'text', placeholder: 'e.g. Bengaluru' },
    { key: 'district', label: 'District', type: 'text', placeholder: 'e.g. Bengaluru Urban' },
    { key: 'state', label: 'State', type: 'text', placeholder: 'e.g. Karnataka' },
    { key: 'price_range', label: 'Price Range', type: 'text', placeholder: 'e.g. ₹₹' },
    { key: 'opening_hours', label: 'Opening Hours', type: 'text', placeholder: 'e.g. Mon-Sat 9AM-9PM' },
    { key: 'image_url', label: 'Image URL', type: 'url', placeholder: 'https://example.com/photo.jpg' },
  ]

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="p-2 hover:bg-surface-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-surface-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Edit Business</h1>
          <p className="text-surface-500 text-sm">Update your listing information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4 max-w-2xl">
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${message === 'Saved successfully!' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-surface-700 mb-1">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea value={biz[f.key] || ''} onChange={(e) => setBiz({ ...biz, [f.key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-whatsapp/40 text-sm"
                rows={3} placeholder={f.placeholder} />
            ) : (
              <input type={f.type} value={biz[f.key] || ''} onChange={(e) => setBiz({ ...biz, [f.key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-whatsapp/40 text-sm"
                placeholder={f.placeholder} />
            )}
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Services (legacy, one per line)</label>
          <textarea value={(biz.services || '').replace(/,/g, '\n')}
            onChange={(e) => setBiz({ ...biz, services: e.target.value.split('\n').filter(Boolean).join(',') })}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-whatsapp/40 text-sm"
            rows={3} placeholder="Service 1&#10;Service 2&#10;Service 3" />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/dashboard" className="px-6 py-2.5 border border-surface-200 text-surface-600 font-medium rounded-xl hover:bg-surface-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-surface-200 p-6 max-w-2xl mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-whatsapp" /> SEO Services
          </h2>
        </div>
        <p className="text-xs text-surface-400 mb-4">Add services with ranking keywords. Each service gets its own SEO page at /service/[name].</p>

        <div className="flex items-center gap-2 mb-4">
          <input type="text" value={newSvc} onChange={(e) => setNewSvc(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
            placeholder="Service name (e.g. Haircut)" />
          <input type="text" value={newKw} onChange={(e) => setNewKw(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
            placeholder="Keywords (comma-separated)" />
          <button onClick={addService} disabled={!newSvc.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-whatsapp text-white text-sm font-medium rounded-xl hover:bg-whatsapp-dark transition-colors disabled:opacity-50 shrink-0">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {svcs.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-6">No SEO services added yet.</p>
        ) : (
          <div className="space-y-2">
            {svcs.map(svc => (
              <div key={svc.id} className="flex items-center gap-2 p-3 bg-surface-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-surface-900">{svc.name}</span>
                    <a href={`/service/${svc.slug}`} target="_blank" rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <input type="text" value={editKw[svc.id] || ''}
                    onChange={(e) => setEditKw({ ...editKw, [svc.id]: e.target.value })}
                    className="w-full mt-1 px-2 py-1 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-1 focus:ring-whatsapp/40"
                    placeholder="Ranking keywords (comma-separated)" />
                </div>
                <button onClick={() => saveKeywords(svc.id)} disabled={svcSaving.has(svc.id)}
                  className="px-2.5 py-1.5 bg-whatsapp text-white text-xs font-medium rounded-lg hover:bg-whatsapp-dark transition-colors disabled:opacity-50 shrink-0">
                  {svcSaving.has(svc.id) ? '...' : 'Save'}
                </button>
                <button onClick={() => deleteService(svc.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
