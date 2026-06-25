'use client'

import { useEffect, useState, FormEvent } from 'react'
import { Building2, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Category {
  slug: string
  name: string
}

export default function AddBusinessPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerWhatsapp, setOwnerWhatsapp] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setCategories(data); if (data.length > 0) setCategorySlug(data[0].slug) })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/businesses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, category_slug: categorySlug, city, area, address, website, description, owner_name: ownerName, owner_whatsapp: ownerWhatsapp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Business Submitted!</h1>
        <p className="text-surface-500 mb-6">
          Your business has been submitted for review. Our team will verify the details and approve it shortly. You&apos;ll be able to see it live on ADZBE once approved.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors">
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <Building2 className="w-12 h-12 text-whatsapp mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-surface-900">Add Your Business</h1>
        <p className="text-surface-500 mt-2">
          Get discovered by nearby customers. Submit your business for free and start receiving WhatsApp leads.
        </p>
      </div>

      <div className="bg-gradient-to-r from-whatsapp/10 to-brand-50 rounded-2xl border border-whatsapp/20 p-4 mb-6 text-sm text-surface-700">
        <p className="font-semibold mb-1">Free listing — no charge</p>
        <p className="text-surface-500">Your business will be reviewed by our team and published within 24 hours. <Link href="/premium" className="text-whatsapp font-medium underline">Learn about Premium</Link> for faster approval and top ranking.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-200 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1">Business Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="e.g. Sharma Plumbers" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Phone <span className="text-red-500">*</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Category <span className="text-red-500">*</span></label>
            <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40 bg-white">
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">City <span className="text-red-500">*</span></label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="e.g. Mumbai" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Area / Locality</label>
            <input type="text" value={area} onChange={(e) => setArea(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="e.g. Andheri West" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1">Full Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="Shop no. 5, ABC Road, near XYZ" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="https://example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Your WhatsApp Number</label>
            <input type="tel" value={ownerWhatsapp} onChange={(e) => setOwnerWhatsapp(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="+91 9876543210" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1">About Your Business</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40 resize-none"
              placeholder="Tell customers what you offer..." />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors disabled:opacity-50 text-base">
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>

        <p className="text-xs text-surface-400 text-center">
          By submitting, you agree to our terms. Your business will be reviewed and published once approved.
        </p>
      </form>
    </div>
  )
}
