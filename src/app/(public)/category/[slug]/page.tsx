import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import { BreadcrumbJsonLd } from '@/components/JsonLd'
import { MessageCircle, Zap, TrendingUp, ChevronRight, Building2, MapPin } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const catName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title: `Best ${catName} Services in India | Connect on WhatsApp`,
    description: `Find the best ${catName} services across India. Top-rated, verified, and ready to connect on WhatsApp. Get a response in minutes.`,
    alternates: { canonical: `https://adzbe.cloud/category/${slug}` },
    openGraph: {
      title: `Best ${catName} Services in India | ADZBE`,
      description: `Find the best ${catName} services across India. Connect instantly via WhatsApp.`,
      siteName: 'ADZBE',
      locale: 'en_IN',
    },
  }
}

export default async function CategorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const catName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const catResult = await db.execute({
    sql: "SELECT slug FROM categories WHERE slug = ?",
    args: [slug],
  })
  if (catResult.rows.length === 0) notFound()

  const businessesResult = await db.execute({
    sql: "SELECT slug, name, category_slug, city, area, district, state, rating, reviews_count, phone, address, verified, featured FROM businesses WHERE category_slug = ? AND status = 'approved' ORDER BY featured DESC, created_at DESC LIMIT 50",
    args: [slug],
  })
  const businesses = businessesResult.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; address: string; verified: number; featured: number
  }[]

  const cities = [...new Set(businesses.map((b) => b.city))]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', item: 'https://adzbe.cloud/' },
        { name: catName, item: `https://adzbe.cloud/category/${slug}` },
      ]} />
      <div>
        <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">{catName}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Best {catName} Services in India
            </h1>
            <p className="text-surface-300 max-w-2xl">
              Connect with top-rated {slug} services across India. Chat on WhatsApp for instant response.
            </p>
            {cities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {cities.slice(0, 12).map((c) => (
                  <Link
                    key={c}
                    href={`/category/${c.toLowerCase()}/${slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    <MapPin className="w-3 h-3" /> {c}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-8 bg-white border-b border-surface-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1.5 text-surface-700 font-medium">
                <TrendingUp className="w-4 h-4 text-whatsapp" /> {businesses.length} {catName} available
              </span>
              <span className="flex items-center gap-1.5 text-surface-500">
                <Zap className="w-4 h-4 text-whatsapp" /> Fast response guaranteed
              </span>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {businesses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-surface-500 mb-2">No businesses found in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((biz, i) => (
                  <BusinessCard
                    key={biz.slug}
                    slug={biz.slug}
                    name={biz.name}
                    category={biz.category_slug}
                    city={biz.city}
                    area={biz.area}
                    district={biz.district}
                    state={biz.state}
                    rating={biz.rating}
                    reviewsCount={biz.reviews_count}
                    phone={biz.phone}
                    address={biz.address}
                    verified={Boolean(biz.verified)}
                    featured={Boolean(biz.featured)}
                    rank={i + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-8 md:p-10 text-center">
              <MessageCircle className="w-12 h-12 text-whatsapp mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-surface-900 mb-2">Don&apos;t see your business?</h2>
              <p className="text-surface-500 mb-6 max-w-md mx-auto text-sm">
                Get listed on ADZBE and start receiving WhatsApp leads from customers today.
              </p>
              <Link
                href="/add-business"
                className="inline-flex items-center gap-2 px-6 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors shadow-md shadow-whatsapp/20"
              >
                <Building2 className="w-4 h-4" /> Add Your Business
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
