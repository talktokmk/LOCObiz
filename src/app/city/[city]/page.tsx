import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import { ArrowLeft, MessageCircle } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  return {
    title: `Local Businesses in ${cityName} | LOCObiz`,
    description: `Find the best local businesses, services, and shops in ${cityName}. Browse ratings, reviews, and connect instantly via WhatsApp.`,
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)

  const businessesResult = await db.execute({
    sql: 'SELECT slug, name, category_slug, city, area, district, state, rating, reviews_count, phone, verified, featured FROM businesses WHERE LOWER(city) = LOWER(?) ORDER BY featured DESC, rating DESC, reviews_count DESC',
    args: [city],
  })
  const businesses = businessesResult.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; verified: number; featured: number
  }[]

  if (businesses.length === 0) notFound()

  const categories = [...new Set(businesses.map((b) => b.category_slug))]

  return (
    <div>
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1 text-surface-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Businesses in {cityName}</h1>
          <p className="text-surface-300 max-w-2xl">
            Find trusted local businesses, services, and shops in {cityName}. Connect instantly via WhatsApp.
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-8 bg-white border-b border-surface-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-surface-500 mr-1">Categories:</span>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${city}/${cat}`}
                  className="px-3 py-1.5 bg-surface-100 text-surface-700 rounded-full text-sm hover:bg-whatsapp-light hover:text-green-800 hover:font-medium transition-all"
                >
                  {cat.replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-surface-900 mb-6">
            {businesses.length} businesses in {cityName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((biz) => (
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
                verified={Boolean(biz.verified)}
                featured={Boolean(biz.featured)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
