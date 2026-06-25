import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import { BreadcrumbJsonLd } from '@/components/JsonLd'
import { MessageCircle, Zap, TrendingUp, ChevronRight, Building2, MapPin } from 'lucide-react'

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ city?: string }> }) {
  const { slug } = await params
  const sp = await searchParams
  const catName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const cityFilter = sp.city ? ` in ${sp.city.charAt(0).toUpperCase() + sp.city.slice(1)}` : ''
  return {
    title: `Best ${catName}${cityFilter} — Find & Connect on WhatsApp`,
    description: `Find the best ${catName} services${cityFilter || ' across India'}. Top-rated, verified, and ready to connect on WhatsApp.`,
    alternates: { canonical: `https://adzbe.cloud/category/${slug}${sp.city ? `?city=${sp.city}` : ''}` },
    openGraph: {
      title: `Best ${catName}${cityFilter} | ADZBE`,
      description: `Find the best ${catName} services${cityFilter || ' across India'}. Connect instantly via WhatsApp.`,
      siteName: 'ADZBE',
      locale: 'en_IN',
    },
  }
}

export default async function CategorySlugPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ city?: string }> }) {
  const { slug } = await params
  const sp = await searchParams
  const catName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const catResult = await db.execute({ sql: 'SELECT id, name FROM categories WHERE slug = ?', args: [slug] })
  if (catResult.rows.length === 0) notFound()
  const category = catResult.rows[0] as unknown as { id: number; name: string }

  let cityFilter = ''
  let cityName = ''
  if (sp.city) {
    cityFilter = sp.city
    cityName = sp.city.charAt(0).toUpperCase() + sp.city.slice(1)
  }

  const businessesResult = await db.execute({
    sql: cityFilter
      ? "SELECT * FROM businesses WHERE category_slug = ? AND LOWER(city) = LOWER(?) AND status = 'approved' ORDER BY featured DESC, whatsapp_clicks DESC, rating DESC, reviews_count DESC"
      : "SELECT * FROM businesses WHERE category_slug = ? AND status = 'approved' ORDER BY featured DESC, whatsapp_clicks DESC, rating DESC, reviews_count DESC",
    args: cityFilter ? [slug, cityFilter] : [slug],
  })
  const businesses = businessesResult.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; address: string; verified: number; featured: number
  }[]

  if (businesses.length === 0 && !cityFilter) notFound()

  const citiesResult = await db.execute({
    sql: "SELECT DISTINCT city, COUNT(*) as count FROM businesses WHERE category_slug = ? AND status = 'approved' GROUP BY city ORDER BY count DESC LIMIT 20",
    args: [slug],
  })
  const cities = citiesResult.rows as unknown as { city: string; count: number }[]

  const totalBiz = businesses.length
  const totalCities = cities.length

  const breadcrumbItems = [
    { name: 'Home', item: 'https://adzbe.cloud/' },
    ...(cityName ? [{ name: cityName, item: `https://adzbe.cloud/city/${cityFilter}` }] : []),
    { name: catName, item: `https://adzbe.cloud/category/${slug}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div>
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            {cityName && (
              <>
                <Link href={`/city/${cityFilter}`} className="hover:text-white transition-colors">{cityName}</Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-white">{catName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {cityName ? `Best ${catName} in ${cityName}` : `Best ${catName} Services`}
          </h1>
          <p className="text-surface-300 max-w-2xl">
            {cityName
              ? `Find trusted ${slug.replace(/-/g, ' ')} services in ${cityName}. Connect instantly on WhatsApp.`
              : `Find trusted ${slug.replace(/-/g, ' ')} services across India. Connect instantly on WhatsApp.`}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-surface-400">
            <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-whatsapp-light" /> {totalBiz} available</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-whatsapp-light" /> {totalCities} cities</span>
          </div>
        </div>
      </section>

      {cities.length > 0 && !cityFilter && (
        <section className="py-6 bg-white border-b border-surface-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-surface-500 py-1.5">Filter by city:</span>
              {cities.map((c) => (
                <Link
                  key={c.city}
                  href={`/category/${slug}?city=${c.city.toLowerCase()}`}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    cityFilter === c.city.toLowerCase()
                      ? 'bg-whatsapp text-white'
                      : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                  }`}
                >
                  {c.city} ({c.count})
                </Link>
              ))}
              {cityFilter && (
                <Link
                  href={`/category/${slug}`}
                  className="px-3 py-1.5 rounded-full text-sm bg-surface-100 text-surface-700 hover:bg-surface-200 transition-colors"
                >
                  Clear filter
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {businesses.length > 0 ? (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {cityFilter && (
              <p className="text-sm text-surface-500 mb-4">{totalBiz} business{totalBiz !== 1 ? 'es' : ''} found</p>
            )}
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
                  address={biz.address}
                  verified={Boolean(biz.verified)}
                  featured={Boolean(biz.featured)}
                  rank={i + 1}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 text-center">
          <div className="max-w-md mx-auto px-4">
            <MessageCircle className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-surface-900 mb-2">No {catName} in {cityName} yet</h2>
            <p className="text-surface-500 text-sm mb-6">Be the first to list your {slug.replace(/-/g, ' ')} service in {cityName}.</p>
            <Link
              href="/add-business"
              className="inline-flex items-center gap-2 px-6 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors"
            >
              <Building2 className="w-4 h-4" /> Add Your Business
            </Link>
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-8 text-center">
            <MessageCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
            <h2 className="text-xl font-bold text-surface-900 mb-2">Own a {catName.replace(/s$/, '')} business?</h2>
            <p className="text-surface-500 text-sm mb-5 max-w-md mx-auto">
              Get listed on ADZBE and start receiving leads directly on WhatsApp. Free listings available.
            </p>
            <Link
              href="/add-business"
              className="inline-flex items-center gap-2 px-6 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors shadow-md shadow-whatsapp/20"
            >
              <Building2 className="w-4 h-4" /> Add Your Business Free
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
