'use client'

import { useState, FormEvent } from 'react'

export default function EmailCapture() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const city = (form.elements.namedItem('city') as HTMLInputElement).value
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return <p className="text-whatsapp font-semibold">You&rsquo;re subscribed!</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        name="email"
        placeholder="Your email address"
        required
        className="flex-1 px-4 py-3 rounded-xl border border-surface-300 focus:border-whatsapp focus:ring-2 focus:ring-whatsapp/20 outline-none text-sm"
      />
      <input
        type="text"
        name="city"
        placeholder="Your city (optional)"
        className="flex-1 px-4 py-3 rounded-xl border border-surface-300 focus:border-whatsapp focus:ring-2 focus:ring-whatsapp/20 outline-none text-sm"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors disabled:opacity-50 whitespace-nowrap text-sm"
      >
        {status === 'loading' ? 'Submitting...' : 'Subscribe'}
      </button>
      {status === 'error' && <p className="text-red-500 text-sm">Something went wrong. Try again.</p>}
    </form>
  )
}
