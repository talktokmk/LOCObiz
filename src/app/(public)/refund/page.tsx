import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, RotateCcw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund Policy | ADZBE',
  description: 'ADZBE refund and cancellation policy for claimed listings and premium subscriptions.',
  alternates: { canonical: 'https://adzbe.cloud/refund' },
  openGraph: {
    title: 'Refund Policy | ADZBE',
    description: 'Refund and cancellation policy for ADZBE listings and subscriptions.',
    url: 'https://adzbe.cloud/refund',
    siteName: 'ADZBE',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Refund Policy</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <RotateCcw className="w-8 h-8 text-whatsapp" />
            <h1 className="text-3xl md:text-4xl font-bold">Refund Policy</h1>
          </div>
          <p className="text-surface-300">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-surface">
          <h2>1. Claim Fee (₹499 One-Time)</h2>
          <p>The ₹499 claim fee is a one-time payment to verify and claim ownership of a business listing. Refunds are provided under the following conditions:</p>
          <ul>
            <li><strong>Full refund:</strong> If your listing is not approved within 7 days of payment</li>
            <li><strong>No refund:</strong> Once your listing has been approved and is live on the platform</li>
            <li><strong>Duplicate claim:</strong> If you accidentally claimed the same business twice, we will refund the duplicate payment</li>
          </ul>

          <h2>2. Premium Subscription (₹499/Month)</h2>
          <ul>
            <li><strong>Cancellation:</strong> You may cancel your Premium subscription at any time. Access continues until the end of the current billing period.</li>
            <li><strong>Refunds:</strong> We do not provide refunds for partial months. If you cancel on day 1, access continues for the full month paid.</li>
            <li><strong>Annual plans:</strong> If purchased annually, refunds are prorated for unused months, minus a 15% processing fee.</li>
          </ul>

          <h2>3. How to Request a Refund</h2>
          <p>Contact us via:</p>
          <ul>
            <li>Email: <a href="mailto:support@adzbe.cloud">support@adzbe.cloud</a></li>
            <li>WhatsApp: <a href="https://wa.me/918618008168">+91 8618008168</a></li>
          </ul>
          <p>Include your business name, phone number, and payment transaction ID. We will process your request within 5-7 business days.</p>

          <h2>4. Payment Disputes</h2>
          <p>If you believe a charge was made in error, please contact us first before filing a dispute with your bank. We will work to resolve the issue promptly.</p>

          <h2>5. Changes to This Policy</h2>
          <p>We reserve the right to modify this refund policy. Changes will be posted on this page with an updated date.</p>
        </div>
      </section>
    </div>
  )
}
