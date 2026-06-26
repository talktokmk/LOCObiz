import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import Script from 'next/script'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#25D366',
  colorScheme: 'light',
}

export const metadata: Metadata = {
  title: {
    default: 'ADZBE - Find Local Businesses Near You | Connect on WhatsApp',
    template: '%s | ADZBE',
  },
  description: 'India\'s WhatsApp-first local business directory. Find trusted plumbers, electricians, salons, doctors and more near you. Browse ratings, read reviews, and connect instantly.',
  keywords: ['local business', 'India', 'business directory', 'near me', 'restaurants', 'services', 'plumber', 'electrician', 'salon', 'doctor', 'WhatsApp'],
  applicationName: 'ADZBE',
  authors: [{ name: 'ADZBE' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  creator: 'ADZBE',
  publisher: 'ADZBE',
  category: 'business',
  classification: 'Business Directory',
  openGraph: {
    title: 'ADZBE - Find Local Businesses & Connect on WhatsApp',
    description: 'India\'s fastest WhatsApp business discovery platform. Find trusted plumbers, electricians, salons, doctors and more near you. Connect instantly.',
    siteName: 'ADZBE',
    type: 'website',
    locale: 'en_IN',
    countryName: 'India',
    images: [{ url: 'https://adzbe.cloud/opengraph-image.png', width: 1200, height: 630, alt: 'ADZBE - Local Business Directory' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADZBE - Find Local Businesses on WhatsApp',
    description: 'Find trusted local businesses near you. Connect instantly via WhatsApp.',
    site: '@adzbe',
    creator: '@adzbe',
    images: ['https://adzbe.cloud/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-icon.svg',
  },
  other: {
    'google-site-verification': '',
  },
  appleWebApp: {
    capable: true,
    title: 'ADZBE',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ADZBE',
    url: 'https://adzbe.cloud',
    logo: 'https://adzbe.cloud/logo.svg',
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
