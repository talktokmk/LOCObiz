import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Claim Your Business | ₹499 | ADZBE',
  description: 'Claim your business listing on ADZBE for ₹499 one-time. Verify ownership, update your info, and get more WhatsApp leads.',
  alternates: { canonical: 'https://adzbe.cloud/claim' },
  openGraph: {
    title: 'Claim Your Business — ₹499 | ADZBE',
    description: 'Claim and verify your business listing on ADZBE. One-time fee of ₹499.',
    url: 'https://adzbe.cloud/claim',
    siteName: 'ADZBE',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return children
}
