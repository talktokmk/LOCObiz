'use client'

import { Suspense, useState, FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { Building2, CheckCircle } from 'lucide-react'

function ClaimForm() {
  const searchParams = useSearchParams()
  const initialSlug = searchParams.get('slug') || ''
  const [slug, setSlug] = useState(initialSlug)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/businesses/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, phone }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit claim')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Claim Submitted!</h1>
        <p className="text-surface-500">
          We&apos;ll verify your ownership and get back to you within 48 hours.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <Building2 className="w-12 h-12 text-brand-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-surface-900">Claim Your Business</h1>
        <p className="text-surface-500 mt-1">
          Own this business? Verify your ownership to manage your listing.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Business Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="your-business-slug"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Your Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="+91 9876543210"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
        >
          Submit Claim
        </button>
      </form>
    </div>
  )
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-16 text-center text-surface-500">Loading...</div>}>
      <ClaimForm />
    </Suspense>
  )
}
