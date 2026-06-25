import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import SearchBar from '@/components/SearchBar'
import { ArrowLeft } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  return {
    title: `Best Local Businesses in ${cityName}`,
    description: `Discover the best local businesses, services, and shops in ${cityName}. Find trusted restaurants, salons, doctors, plumbers and more in ${cityName}.`,
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)

  const categoriesResult = await db.execute({
    sql: 'SELECT DISTINCT category_slug FROM businesses WHERE LOWER(city) = LOWER(?) ORDER BY category_slug',
    args: [city],
  })
  const categories = categoriesResult.rows as unknown as { category_slug: string }[]

  const businessesResult = await db.execute({
    sql: 'SELECT * FROM businesses WHERE LOWER(city) = LOWER(?) ORDER BY rating DESC, reviews_count DESC LIMIT 20',
    args: [city],
  })
  const businesses = businessesResult.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; verified: number; featured: number
  }[]

  if (businesses.length === 0) notFound()

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1 text-brand-200 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Businesses in {cityName}</h1>
          <p className="text-brand-100 mb-6">
            Find the best local businesses, services, and shops in {cityName}.
          </p>
          <SearchBar initialCity={cityName} />
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-8 bg-white border-b border-surface-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-semibold text-surface-500 uppercase mb-3">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.category_slug}
                  href={`/category/${city}/${cat.category_slug}`}
                  className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  {cat.category_slug.charAt(0).toUpperCase() + cat.category_slug.slice(1)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-surface-900 mb-6">
            {businesses.length} Businesses found in {cityName}
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
