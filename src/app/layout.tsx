import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ADZBE - Find Local Businesses Near You',
    template: '%s | ADZBE',
  },
  description: 'Discover the best local businesses in your city. Search restaurants, salons, doctors, plumbers and more in India.',
  keywords: ['local business', 'India', 'business directory', 'near me', 'restaurants', 'services'],
  openGraph: {
    title: 'ADZBE - Find Local Businesses Near You',
    description: 'Discover the best local businesses in your city.',
    siteName: 'ADZBE',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ADZBE',
    url: 'https://adzbe.cloud',
    logo: 'https://adzbe.cloud/logo.png',
    description: 'India\'s WhatsApp-first local business discovery platform.',
    areaServed: 'IN',
  }

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
