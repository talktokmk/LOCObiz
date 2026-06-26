'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, LogIn } from 'lucide-react'

export default function OwnerLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 text-whatsapp mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-surface-900">Owner Login</h1>
          <p className="text-surface-500 text-sm mt-1">Sign in to manage your business</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
              placeholder="Enter your password" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? 'Signing in...' : <><LogIn className="w-4 h-4" /> Sign In</>}
          </button>
          <p className="text-center text-sm text-surface-500">
            Not registered? <Link href="/owner/register" className="text-whatsapp font-medium hover:underline">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
