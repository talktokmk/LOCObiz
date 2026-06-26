'use client'

import { useState } from 'react'
import { Share2, Flag, X } from 'lucide-react'

export function WaShareButton({ name, slug }: { name: string; slug: string }) {
  const text = `Check out ${name} on ADZBE!\nhttps://adzbe.cloud/business/${slug}`
  return (
    <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-whatsapp/10 text-whatsapp-dark text-xs font-medium rounded-full hover:bg-whatsapp/20 transition-colors">
      <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
    </a>
  )
}

export function ReportButton({ businessId }: { businessId: number }) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [phone, setPhone] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return
    await fetch('/api/businesses/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: businessId, reason, details, reporter_phone: phone }),
    })
    setSent(true)
    setReason('')
    setDetails('')
    setPhone('')
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-surface-400 text-xs font-medium rounded-full hover:bg-surface-100 transition-colors">
        <Flag className="w-3.5 h-3.5" /> Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900">Report Listing</h3>
              <button onClick={() => { setOpen(false); setSent(false) }} className="text-surface-400 hover:text-surface-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sent ? (
              <div className="text-center py-6">
                <Flag className="w-10 h-10 text-whatsapp mx-auto mb-3" />
                <p className="text-surface-900 font-medium mb-1">Report Submitted</p>
                <p className="text-sm text-surface-500">We'll review and take action if needed.</p>
                <button onClick={() => { setOpen(false); setSent(false) }}
                  className="mt-4 px-4 py-2 bg-surface-100 text-surface-700 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Reason *</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} required
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40">
                    <option value="">Select a reason...</option>
                    <option value="wrong_phone">Wrong phone number</option>
                    <option value="wrong_address">Wrong address</option>
                    <option value="closed">Business closed</option>
                    <option value="spam">Spam or fake listing</option>
                    <option value="duplicate">Duplicate listing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Details (optional)</label>
                  <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40 resize-none"
                    placeholder="Tell us more about the issue..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Your Phone (optional)</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
                    placeholder="+91 9876543210" />
                </div>
                <button type="submit"
                  className="w-full py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors text-sm">
                  Submit Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}