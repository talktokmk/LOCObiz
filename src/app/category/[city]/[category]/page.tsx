import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import { ArrowLeft } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ city: string; category: string }> }) {
  const { city, category } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  const catName = category.charAt(0).toUpperCase() + category.slice(1)
  return {
    title: `Best ${catName} in ${cityName}`,
    description: `Find the best ${category} services in ${cityName}. Top-rated ${category} near you in ${cityName} with reviews, ratings, and contact info.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ city: string; category: string }> }) {
  const { city, category } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  const catName = category.charAt(0).toUpperCase() + category.slice(1)

  const businessesResult = await db.execute({
    sql: 'SELECT * FROM businesses WHERE LOWER(city) = LOWER(?) AND category_slug = ? ORDER BY rating DESC, reviews_count DESC',
    args: [city, category],
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
          <Link href={`/city/${city}`} className="inline-flex items-center gap-1 text-brand-200 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> {cityName}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{catName} in {cityName}</h1>
          <p className="text-brand-100">
            Find the best {category} services, near you in {cityName}. Browse ratings, reviews, and contact information.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-surface-900 mb-6">
            {businesses.length} {catName} found in {cityName}
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
