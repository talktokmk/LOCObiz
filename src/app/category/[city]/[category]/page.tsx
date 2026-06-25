import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import { ArrowLeft, MessageCircle } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ city: string; category: string }> }) {
  const { city, category } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  const catName = category.charAt(0).toUpperCase() + category.slice(1)
  return {
    title: `Best ${catName} in ${cityName} | LOCObiz`,
    description: `Find the best ${category} services in ${cityName}. Top-rated ${category} near you with reviews, ratings, and instant WhatsApp connect.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ city: string; category: string }> }) {
  const { city, category } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  const catName = category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const businessesResult = await db.execute({
    sql: 'SELECT * FROM businesses WHERE LOWER(city) = LOWER(?) AND category_slug = ? ORDER BY featured DESC, rating DESC, reviews_count DESC',
    args: [city, category],
  })
  const businesses = businessesResult.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; verified: number; featured: number
  }[]

  if (businesses.length === 0) notFound()

  return (
    <div>
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/city/${city}`} className="inline-flex items-center gap-1 text-surface-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {cityName}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{catName} in {cityName}</h1>
          <p className="text-surface-300 max-w-2xl">
            Find the best {category} services near you in {cityName}. Browse ratings, reviews, and connect instantly via WhatsApp.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-surface-900">
              {businesses.length} {catName} in {cityName}
            </h2>
          </div>
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
                verified={Boolean(biz.verified)}
                featured={Boolean(biz.featured)}
                rank={i + 1}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-whatsapp-light rounded-2xl p-8 md:p-10 text-center">
            <MessageCircle className="w-12 h-12 text-whatsapp mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-surface-900 mb-2">Don&apos;t see your business?</h2>
            <p className="text-surface-600 mb-6 max-w-md mx-auto">
              Get listed on LOCObiz and start receiving leads via WhatsApp today.
            </p>
            <a
              href={`https://wa.me/919000000000?text=Hi%2C%20I%20want%20to%20list%20my%20business%20on%20LOCObiz%20in%20${cityName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> List Your Business
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
