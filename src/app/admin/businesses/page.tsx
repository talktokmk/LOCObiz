'use client'

import { useEffect, useState } from 'react'
import { Search, Star, CheckCircle, XCircle } from 'lucide-react'

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
  created_at: string
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBusinesses()
  }, [])

  async function fetchBusinesses() {
    try {
      const res = await fetch('/api/admin/businesses')
      if (res.ok) {
        const data = await res.json()
        setBusinesses(data)
      }
    } finally {
      setLoading(false)
    }
  }

  async function toggleFeatured(id: number, current: number) {
    await fetch('/api/admin/businesses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, featured: current ? 0 : 1 }),
    })
    fetchBusinesses()
  }

  async function toggleVerified(id: number, current: number) {
    await fetch('/api/admin/businesses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, verified: current ? 0 : 1 }),
    })
    fetchBusinesses()
  }

  async function deleteBusiness(id: number) {
    if (!confirm('Are you sure you want to delete this business?')) return
    await fetch(`/api/admin/businesses?id=${id}`, { method: 'DELETE' })
    fetchBusinesses()
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
        <h1 className="text-2xl font-bold text-surface-900">Businesses</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9 pr-4 py-2 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-3 font-medium text-surface-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-surface-600">District</th>
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
              {filtered.map((biz) => (
                <tr key={biz.id} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="px-4 py-3 font-medium text-surface-900">{biz.name}</td>
                  <td className="px-4 py-3 text-surface-600">{biz.district || '-'}</td>
                  <td className="px-4 py-3 text-surface-600 capitalize">{biz.state?.replace(/-/g, ' ') || '-'}</td>
                  <td className="px-4 py-3 text-surface-600 capitalize">{biz.category_slug}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {biz.rating}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-surface-600">{biz.views}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleFeatured(biz.id, biz.featured)}>
                      {biz.featured ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-surface-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleVerified(biz.id, biz.verified)}>
                      {biz.verified ? <CheckCircle className="w-5 h-5 text-brand-600" /> : <XCircle className="w-5 h-5 text-surface-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteBusiness(biz.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
