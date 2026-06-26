import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import Script from 'next/script'
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
    images: [{ url: 'https://adzbe.cloud/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADZBE - Find Local Businesses Near You',
    description: 'Discover the best local businesses in your city.',
  },
  robots: {
    index: true,
    follow: true,
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-whatsapp focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        <Script id="jsonld-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(orgSchema)}
        </Script>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
