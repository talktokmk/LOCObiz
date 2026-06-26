'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
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

export default function EditBusinessPage() {
  const router = useRouter()
  const [biz, setBiz] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/owner/business')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.length > 0) setBiz(data[0])
        else router.push('/dashboard')
      })
      .finally(() => setLoading(false))
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
      if (res.ok) {
        setMessage('Saved successfully!')
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
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
          <label className="block text-sm font-medium text-surface-700 mb-1">Services (one per line)</label>
          <textarea value={(biz.services || '').replace(/,/g, '\n')}
            onChange={(e) => setBiz({ ...biz, services: e.target.value.split('\n').filter(Boolean).join(',') })}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-whatsapp/40 text-sm"
            rows={4} placeholder="Service 1&#10;Service 2&#10;Service 3" />
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
    </div>
  )
}
