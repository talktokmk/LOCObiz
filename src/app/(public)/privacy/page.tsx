import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | ADZBE',
  description: 'ADZBE privacy policy — how we collect, use, and protect your data.',
  alternates: { canonical: 'https://adzbe.cloud/privacy' },
  openGraph: {
    title: 'Privacy Policy | ADZBE',
    description: 'How ADZBE collects, uses, and protects your data.',
    url: 'https://adzbe.cloud/privacy',
    siteName: 'ADZBE',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Privacy Policy</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-8 h-8 text-whatsapp" />
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-surface-300">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-surface">
          <h2>1. Information We Collect</h2>
          <p>When you use ADZBE, we may collect:</p>
          <ul>
            <li><strong>Business information:</strong> name, phone, email, address, website, description, and services you provide</li>
            <li><strong>Usage data:</strong> search queries, pages visited, WhatsApp click interactions</li>
            <li><strong>Device information:</strong> IP address, browser type, operating system</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To list your business on ADZBE and make it discoverable to users</li>
            <li>To connect users with businesses via WhatsApp</li>
            <li>To improve our search and recommendation algorithms</li>
            <li>To send administrative communications about your listing</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We do not sell your personal information to third parties. We may share information with:</p>
          <ul>
            <li><strong>Service providers:</strong> hosting, analytics, and payment processing partners who operate under strict confidentiality agreements</li>
            <li><strong>Legal authorities:</strong> when required by law or to protect our rights</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We implement industry-standard security measures including HTTPS encryption, secure password hashing, and regular security audits. However, no method of transmission over the Internet is 100% secure.</p>

          <h2>5. Data Retention</h2>
          <p>We retain your information as long as your business listing is active. Upon deletion request, we will remove your data within 30 days unless retention is required by law.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2>7. Contact</h2>
          <p>For privacy-related inquiries, contact us at <a href="mailto:support@adzbe.cloud">support@adzbe.cloud</a> or via WhatsApp at <a href="https://wa.me/918618008168">+91 8618008168</a>.</p>
        </div>
      </section>
    </div>
  )
}
