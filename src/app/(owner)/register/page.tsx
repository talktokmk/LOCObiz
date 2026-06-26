'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, UserPlus } from 'lucide-react'

export default function OwnerRegisterPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/owner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Registration failed')
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 text-whatsapp mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-surface-900">Create Account</h1>
          <p className="text-surface-500 text-sm mt-1">Register to manage your claimed business</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="+91 9876543210" />
            <p className="text-xs text-surface-400 mt-1">Must match the phone used when claiming your business</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="At least 6 characters" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? 'Creating...' : <><UserPlus className="w-4 h-4" /> Create Account</>}
          </button>
          <p className="text-center text-sm text-surface-500">
            Already registered? <Link href="/login" className="text-whatsapp font-medium hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
