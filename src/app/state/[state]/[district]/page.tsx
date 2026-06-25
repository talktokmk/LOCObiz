import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getStateBySlug } from '@/lib/states'
import BusinessCard from '@/components/BusinessCard'
import { ArrowLeft, MessageCircle } from 'lucide-react'

function normalizeSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; district: string }> }) {
  const { state, district } = await params
  const st = getStateBySlug(state)
  if (!st) return { title: 'Not Found' }
  return {
    title: `Businesses in ${district.replace(/-/g, ' ')}, ${st.name} | LOCObiz`,
    description: `Find local businesses in ${district.replace(/-/g, ' ')}, ${st.name}. Restaurants, salons, doctors and more — connect via WhatsApp.`,
  }
}

export default async function DistrictPage({ params }: { params: Promise<{ state: string; district: string }> }) {
  const { state, district } = await params
  const st = getStateBySlug(state)
  if (!st) notFound()

  const districtName = district.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const businessesResult = await db.execute({
    sql: 'SELECT slug, name, category_slug, city, area, district, state, rating, reviews_count, phone, verified, featured FROM businesses WHERE state = ? AND LOWER(district) = LOWER(?) ORDER BY featured DESC, rating DESC, reviews_count DESC',
    args: [state, districtName],
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
          <Link href={`/state/${state}`} className="inline-flex items-center gap-1 text-surface-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {st.name}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{districtName}</h1>
          <p className="text-surface-300">
            {businesses.length} businesses found in {districtName}, {st.name}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((biz) => (
              <BusinessCard
                key={biz.slug}
                slug={biz.slug}
                name={biz.name}
                category={biz.category_slug}
                city={biz.city}
                area={biz.area}
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
