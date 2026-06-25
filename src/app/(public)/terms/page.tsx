import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | ADZBE',
  description: 'ADZBE terms of service — rules and guidelines for using our platform.',
  alternates: { canonical: 'https://adzbe.cloud/terms' },
  openGraph: {
    title: 'Terms of Service | ADZBE',
    description: 'Rules and guidelines for using ADZBE.',
    url: 'https://adzbe.cloud/terms',
    siteName: 'ADZBE',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Terms of Service</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-8 h-8 text-whatsapp" />
            <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-surface-300">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-surface">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using ADZBE (adzbe.cloud), you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>

          <h2>2. Business Listings</h2>
          <ul>
            <li>Business owners are responsible for the accuracy of their listing information</li>
            <li>ADZBE reserves the right to reject, remove, or modify listings that violate our guidelines</li>
            <li>Listings must represent a real, operating business</li>
            <li>Duplicate listings are not permitted</li>
          </ul>

          <h2>3. User Conduct</h2>
          <p>Users agree not to:</p>
          <ul>
            <li>Submit false or misleading information</li>
            <li>Use the platform for spam, harassment, or illegal purposes</li>
            <li>Attempt to manipulate rankings or reviews</li>
            <li>Scrape or reproduce content without permission</li>
          </ul>

          <h2>4. Claimed & Premium Listings</h2>
          <ul>
            <li>Claiming a business verifies ownership and provides management access</li>
            <li>Premium subscriptions are billed monthly and auto-renew unless cancelled</li>
            <li>Refunds are governed by our separate Refund Policy</li>
            <li>ADZBE may change pricing with 30 days notice</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>All content on ADZBE, including logos, design, and software, is owned by ADZBE. Business listings remain the property of the respective business owners.</p>

          <h2>6. Limitation of Liability</h2>
          <p>ADZBE is a discovery platform and does not guarantee the quality, reliability, or legality of listed businesses. We are not liable for transactions or interactions between users and businesses.</p>

          <h2>7. Termination</h2>
          <p>ADZBE may suspend or terminate access to the platform for violations of these terms, without prior notice.</p>

          <h2>8. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use after changes constitutes acceptance of the new terms.</p>

          <h2>9. Contact</h2>
          <p>For questions about these terms, contact <a href="mailto:support@adzbe.cloud">support@adzbe.cloud</a>.</p>
        </div>
      </section>
    </div>
  )
}
