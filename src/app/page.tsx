import Link from 'next/link'
import { db } from '@/lib/db'
import SearchBar from '@/components/SearchBar'
import BusinessCard from '@/components/BusinessCard'
import { Building2, Star, TrendingUp, Shield } from 'lucide-react'

async function getCategories() {
  const result = await db.execute('SELECT * FROM categories ORDER BY name')
  return result.rows as unknown as { id: number; slug: string; name: string; description: string }[]
}

async function getFeaturedBusinesses() {
  const result = await db.execute(
    'SELECT * FROM businesses WHERE featured = 1 ORDER BY rating DESC LIMIT 6'
  )
  return result.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; verified: number; featured: number
  }[]
}

async function getTopRated() {
  const result = await db.execute(
    'SELECT * FROM businesses ORDER BY rating DESC, reviews_count DESC LIMIT 6'
  )
  return result.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; verified: number; featured: number
  }[]
}

export default async function HomePage() {
  const [categories, featured, topRated] = await Promise.all([
    getCategories(), getFeaturedBusinesses(), getTopRated(),
  ])

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Find Local Businesses Near You
            </h1>
            <p className="text-brand-100 text-lg mb-8">
              Discover trusted local services, restaurants, shops and professionals in your city.
            </p>
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="text-center p-4 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-all"
              >
                <Building2 className="w-6 h-6 text-brand-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-surface-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-surface-900">Featured Businesses</h2>
                <p className="text-surface-500 mt-1">Top-rated businesses in your area</p>
              </div>
              <Star className="w-8 h-8 text-amber-400" />
            </div>
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

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-surface-900">Top Rated</h2>
              <p className="text-surface-500 mt-1">Highest rated businesses across all cities</p>
            </div>
            <TrendingUp className="w-8 h-8 text-brand-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRated.map((biz) => (
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

      <section className="py-16 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-surface-900 mb-12">Why LOCObiz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">Verified Listings</h3>
              <p className="text-surface-500 text-sm">Every business is verified to ensure authentic information.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">Real Reviews</h3>
              <p className="text-surface-500 text-sm">Genuine ratings and reviews from real customers.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">Free & Open</h3>
              <p className="text-surface-500 text-sm">List your business for free and reach local customers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
