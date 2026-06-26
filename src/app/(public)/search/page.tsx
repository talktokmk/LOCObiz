import { db } from '@/lib/db'
import { RANKING_SQL } from '@/lib/ranking'
import SearchBar from '@/components/SearchBar'
import BusinessCard from '@/components/BusinessCard'
import { Zap } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; category?: string; claimed?: string }> }) {
  const sp = await searchParams
  const query = sp.q || ''
  const city = sp.city || ''
  const parts: string[] = []
  if (query) parts.push(query)
  if (city) parts.push(city)
  const label = parts.length ? `"${parts.join(' in ')}"` : 'all services'
  return {
    title: `Search Results for ${label} | ADZBE`,
    description: `Find ${query || 'local services'}${city ? ` in ${city}` : ''}. Browse trusted businesses and connect instantly on WhatsApp.`,
    alternates: { canonical: 'https://adzbe.cloud/search' },
    openGraph: {
      title: `Search Results for ${label} | ADZBE`,
      description: `Find ${query || 'local services'}${city ? ` in ${city}` : ''}. Connect on WhatsApp.`,
      siteName: 'ADZBE',
      locale: 'en_IN',
    },
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; category?: string; claimed?: string }>
}) {
  const sp = await searchParams
  const query = sp.q || ''
  const city = sp.city || ''
  const category = sp.category || ''
  const claimedFilter = sp.claimed === '1'

  let sql = `SELECT slug, name, category_slug, city, area, district, state, rating, reviews_count, phone, whatsapp, address, verified, featured, claimed, ${RANKING_SQL} as ranking_score FROM businesses WHERE status = 'approved'`
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
  if (claimedFilter) {
    sql += ' AND claimed = 1'
  }

  sql += ' ORDER BY ranking_score DESC LIMIT 100'

  const result = await db.execute({ sql, args })
  const businesses = result.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; whatsapp: string; address: string; verified: number; featured: number; claimed: number; ranking_score: number
  }[]

  let searchSummary = 'all services'
  if (query && city) searchSummary = `"${query}" in ${city}`
  else if (query) searchSummary = `"${query}"`
  else if (city) searchSummary = city

  const filterUrl = (params: Record<string, string | undefined>) => {
    const url = new URL('/search', 'https://adzbe.cloud')
    if (query) url.searchParams.set('q', query)
    if (city) url.searchParams.set('city', city)
    if (category) url.searchParams.set('category', category)
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v)
      else url.searchParams.delete(k)
    })
    return url.pathname + url.search
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Find &amp; Connect</h1>
          <SearchBar initialQuery={query} initialCity={city} />
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <Zap className="w-4 h-4 text-whatsapp" />
              {businesses.length} result{businesses.length !== 1 ? 's' : ''} for {searchSummary}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href={filterUrl({ claimed: claimedFilter ? undefined : '1' })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  claimedFilter
                    ? 'bg-whatsapp text-white'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                <Zap className="w-4 h-4" /> Owner Verified Only
              </Link>
            </div>
          </div>
          {businesses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-surface-500 mb-2">
                {claimedFilter ? 'No owner-verified businesses found.' : 'No businesses found for this search.'}
              </p>
              <p className="text-sm text-surface-400">Try a different search term or browse by city above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((biz, i) => (
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
                  whatsapp={biz.whatsapp}
                  address={biz.address}
                  verified={Boolean(biz.verified)}
                  featured={Boolean(biz.featured)}
                  claimed={Boolean(biz.claimed)}
                  rank={i + 1}
                  rankingScore={biz.ranking_score}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
