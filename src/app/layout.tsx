import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'LOCObiz - Find Local Businesses Near You',
    template: '%s | LOCObiz',
  },
  description: 'Discover the best local businesses in your city. Search restaurants, salons, doctors, plumbers and more in India.',
  keywords: ['local business', 'India', 'business directory', 'near me', 'restaurants', 'services'],
  openGraph: {
    title: 'LOCObiz - Find Local Businesses Near You',
    description: 'Discover the best local businesses in your city.',
    siteName: 'LOCObiz',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
