import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add Your Business | ADZBE',
  description: 'List your business on ADZBE for free. Connect with local customers instantly on WhatsApp. Get more leads and grow your business.',
  alternates: { canonical: 'https://adzbe.cloud/add-business' },
  openGraph: {
    title: 'Add Your Business Free | ADZBE',
    description: 'List your business on ADZBE for free. Get more WhatsApp leads today.',
    url: 'https://adzbe.cloud/add-business',
    siteName: 'ADZBE',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function AddBusinessLayout({ children }: { children: React.ReactNode }) {
  return children
}
