import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import { MessageCircle, Zap, TrendingUp, ChevronRight } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ city: string; category: string }> }) {
  const { city, category } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  const catName = category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title: `Best ${catName} in ${cityName} | Connect on WhatsApp`,
    description: `Find the best ${category} services in ${cityName}. Top-rated, verified, and ready to connect on WhatsApp. Get a response in minutes.`,
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
          <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/city/${city}`} className="hover:text-white transition-colors">{cityName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{catName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Best {catName} in {cityName}
          </h1>
          <p className="text-surface-300 max-w-2xl">
            Connect with top-rated {category} services in {cityName}. Chat on WhatsApp for instant response.
          </p>
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
          <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-8 md:p-10 text-center">
            <MessageCircle className="w-12 h-12 text-whatsapp mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-surface-900 mb-2">Don&apos;t see your business?</h2>
            <p className="text-surface-500 mb-6 max-w-md mx-auto text-sm">
              Get listed on LOCObiz and start receiving WhatsApp leads from {cityName} customers today.
            </p>
            <a
              href={`https://wa.me/919000000000?text=Hi%2C%20I%20want%20to%20list%20my%20${category}%20business%20on%20LOCObiz%20in%20${cityName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors shadow-md shadow-whatsapp/20"
            >
              <MessageCircle className="w-4 h-4" /> List Your Business
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
