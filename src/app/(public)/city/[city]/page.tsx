import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import { BreadcrumbJsonLd } from '@/components/JsonLd'
import { MessageCircle, TrendingUp, ArrowRight, ChevronRight, Building2 } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  return {
    title: `Best Services in ${cityName} | Connect on WhatsApp`,
    description: `Find the best local services in ${cityName}. Top-rated plumbers, electricians, salons, doctors and more — connect instantly on WhatsApp.`,
    alternates: { canonical: `https://adzbe.cloud/city/${city}` },
    openGraph: {
      title: `Best Services in ${cityName} | ADZBE`,
      description: `Find the best local services in ${cityName}. Connect instantly on WhatsApp.`,
      siteName: 'ADZBE',
      locale: 'en_IN',
    },
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)

  const businessesResult = await db.execute({
    sql: "SELECT slug, name, category_slug, city, area, district, state, rating, reviews_count, phone, address, verified, featured FROM businesses WHERE LOWER(city) = LOWER(?) AND status = 'approved' ORDER BY featured DESC, created_at DESC",
    args: [city],
  })
  const businesses = businessesResult.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; address: string; verified: number; featured: number
  }[]

  if (businesses.length === 0) notFound()

  const categories = [...new Set(businesses.map((b) => b.category_slug))]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', item: 'https://adzbe.cloud/' },
        { name: `${cityName} Services`, item: `https://adzbe.cloud/city/${city}` },
      ]} />
      <div>
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{cityName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Services in {cityName}
          </h1>
          <p className="text-surface-300 max-w-2xl">
            Find trusted {cityName} businesses ready to connect on WhatsApp. Pick a service or browse top-rated.
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">What service do you need in {cityName}?</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${city}/${cat}`}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-200 rounded-xl hover:border-whatsapp/30 hover:shadow-md transition-all text-sm"
                >
                  <span className="capitalize text-surface-700 group-hover:text-whatsapp-dark transition-colors font-medium">
                    {cat.replace(/-/g, ' ')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-whatsapp transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-whatsapp" /> Top Rated in {cityName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.slice(0, 6).map((biz) => (
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
              />
            ))}
          </div>
          {businesses.length > 6 && (
            <div className="text-center mt-6">
              <Link
                href={`/search?city=${city}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-900 text-white font-semibold rounded-xl hover:bg-surface-800 transition-colors text-sm"
              >
                View all {businesses.length} businesses in {cityName} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-8 text-center">
            <MessageCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
            <h2 className="text-xl font-bold text-surface-900 mb-2">Own a business in {cityName}?</h2>
            <p className="text-surface-500 text-sm mb-5">Get leads directly on WhatsApp.</p>
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
