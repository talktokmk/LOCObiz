import { db } from '@/lib/db'
import SearchBar from '@/components/SearchBar'
import BusinessCard from '@/components/BusinessCard'

export const metadata = {
  title: 'Search Local Businesses',
  description: 'Search for local businesses, services, and shops across India.',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; category?: string }>
}) {
  const sp = await searchParams
  const query = sp.q || ''
  const city = sp.city || ''
  const category = sp.category || ''

  let sql = 'SELECT * FROM businesses WHERE 1=1'
  const args: (string | number)[] = []

  if (query) {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(services) LIKE ?)'
    const like = `%${query.toLowerCase()}%`
    args.push(like, like, like)
  }
  if (city) {
    sql += ' AND LOWER(city) LIKE ?'
    args.push(`%${city.toLowerCase()}%`)
  }
  if (category) {
    sql += ' AND category_slug = ?'
    args.push(category)
  }

  sql += ' ORDER BY featured DESC, rating DESC, reviews_count DESC'

  const result = await db.execute({ sql, args })
  const businesses = result.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; verified: number; featured: number
  }[]

  let searchSummary = 'All Businesses'
  if (query && city) searchSummary = `"${query}" in ${city}`
  else if (query) searchSummary = `"${query}"`
  else if (city) searchSummary = city

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Search Local Businesses</h1>
          <SearchBar initialQuery={query} initialCity={city} />
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-surface-900 mb-6">
            {businesses.length} result{businesses.length !== 1 ? 's' : ''} for {searchSummary}
          </h2>
          {businesses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-surface-500">No businesses found. Try a different search.</p>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </div>
  )
}
