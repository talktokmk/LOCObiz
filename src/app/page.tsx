import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import SearchBar from '@/components/SearchBar'
import { TrendingUp, Building2, Award, MessageCircle } from 'lucide-react'

export default async function HomePage() {
  let featured: {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; verified: number; featured: number
  }[] = []
  let cities: { city: string; count: number }[] = []
  let categories: { category_slug: string; count: number }[] = []

  try {
    const featuredRes = await db.execute(
      'SELECT slug, name, category_slug, city, area, district, state, rating, reviews_count, phone, verified, featured FROM businesses WHERE featured = 1 ORDER BY rating DESC, reviews_count DESC LIMIT 6'
    )
    featured = featuredRes.rows as unknown as typeof featured
    const citiesRes = await db.execute(
      'SELECT city, COUNT(*) as count FROM businesses WHERE city IS NOT NULL GROUP BY city ORDER BY count DESC LIMIT 10'
    )
    cities = citiesRes.rows as unknown as typeof cities
    const catRes = await db.execute(
      'SELECT category_slug, COUNT(*) as count FROM businesses WHERE category_slug IS NOT NULL GROUP BY category_slug ORDER BY count DESC LIMIT 8'
    )
    categories = catRes.rows as unknown as typeof categories
  } catch {}

  return (
    <div>
      <section className="bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-whatsapp/20 text-whatsapp-light rounded-full text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" /> Connect Instantly via WhatsApp
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Find Local Businesses
          </h1>
          <p className="text-lg md:text-xl text-surface-300 mb-10 max-w-2xl mx-auto">
            Search trusted services near you and connect instantly on WhatsApp.
          </p>
          <div className="flex justify-center">
            <SearchBar large />
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-8 text-sm text-surface-400">
            {cities.slice(0, 6).map((c) => (
              <Link key={c.city} href={`/city/${c.city.toLowerCase()}`} className="hover:text-white transition-colors">
                {c.city} ({c.count})
              </Link>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-surface-900 mb-8 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-whatsapp" /> Browse by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.category_slug}
                  href={`/search?category=${cat.category_slug}`}
                  className="block p-4 bg-white border border-surface-200 rounded-xl hover:border-whatsapp/30 hover:shadow-md transition-all text-center"
                >
                  <div className="font-medium text-surface-900 capitalize mb-1">{cat.category_slug.replace(/-/g, ' ')}</div>
                  <div className="text-sm text-surface-500">{cat.count} businesses</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-surface-900 mb-8 flex items-center gap-2">
              <Award className="w-6 h-6 text-whatsapp" /> Featured Businesses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((biz) => (
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
      )}

      {cities.length > 0 && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-surface-900 mb-8 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-whatsapp" /> Popular Cities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {cities.map((c) => (
                <Link
                  key={c.city}
                  href={`/city/${c.city.toLowerCase()}`}
                  className="block p-4 bg-white border border-surface-200 rounded-xl hover:border-whatsapp/30 hover:shadow-md transition-all text-center"
                >
                  <div className="font-medium text-surface-900">{c.city}</div>
                  <div className="text-sm text-surface-500">{c.count} businesses</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
