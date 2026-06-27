import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import BusinessCard from '@/components/BusinessCard'
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd'
import { RANKING_SQL } from '@/lib/ranking'
import { MessageCircle, TrendingUp, ArrowRight, ChevronRight, Building2, HelpCircle } from 'lucide-react'

export const revalidate = 3600

export async function generateStaticParams() {
  const result = await db.execute("SELECT DISTINCT LOWER(city) as city FROM businesses WHERE city IS NOT NULL AND status = 'approved'")
  const rows = result.rows as unknown as { city: string }[]
  return rows.map(r => ({ city: r.city }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)

  const catResult = await db.execute({
    sql: "SELECT DISTINCT category_slug FROM businesses WHERE LOWER(city) = LOWER(?) AND status = 'approved' ORDER BY category_slug LIMIT 6",
    args: [city],
  })
  const cats = (catResult.rows as unknown as { category_slug: string }[]).map(c => c.category_slug.replace(/-/g, ' '))

  return {
    title: `Best Services in ${cityName} | Connect on WhatsApp`,
    description: `Find the best local services in ${cityName} — ${cats.length ? cats.join(', ') : 'plumbers, electricians, salons, doctors and more'}. Connect instantly on WhatsApp.`,
    alternates: { canonical: `https://adzbe.cloud/city/${city}` },
    openGraph: {
      title: `Best Services in ${cityName} | ADZBE`,
      description: `Find trusted ${cityName} businesses and connect on WhatsApp.`,
      siteName: 'ADZBE',
      locale: 'en_IN',
    },
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)

  const businessesResult = await db.execute({
    sql: `SELECT slug, name, category_slug, city, area, district, state, rating, reviews_count, phone, whatsapp, address, verified, featured, claimed, ${RANKING_SQL} as ranking_score FROM businesses WHERE LOWER(city) = LOWER(?) AND status = 'approved' ORDER BY ranking_score DESC`,
    args: [city],
  })
  const businesses = businessesResult.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; whatsapp: string; address: string; verified: number; featured: number; claimed: number; ranking_score: number
  }[]

  if (businesses.length === 0) notFound()

  const categories = [...new Set(businesses.map((b) => b.category_slug))]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', item: 'https://adzbe.cloud/' },
        { name: `${cityName} Services`, item: `https://adzbe.cloud/city/${city}` },
      ]} />
      <FAQJsonLd items={[
        { question: `How do I find a ${categories.length > 0 ? categories[0].replace(/-/g, ' ') : 'service'} in ${cityName}?`, answer: `Search on ADZBE for ${cityName} businesses. Browse ratings, read descriptions, and tap "Chat on WhatsApp" to connect instantly — no forms or phone calls required.` },
        { question: `Are the businesses in ${cityName} verified?`, answer: `Look for the "Owner Verified" badge on listings. These businesses have claimed their profile and verified their ownership. All listings are manually reviewed before being published.` },
        { question: `How much does it cost to list my business in ${cityName}?`, answer: `Basic listings are free. Claim your business for ₹499 to get a dashboard, analytics, and the "Owner Verified" badge. Premium placement is ₹499/month.` },
        { question: `How quickly will a business in ${cityName} respond?`, answer: `Most businesses respond within minutes on WhatsApp. Look for the "Fast Response" badge on listings for businesses that are actively responding.` },
      ]} />
      <div>
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{cityName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Services in {cityName}
          </h1>
          <p className="text-surface-300 max-w-2xl">
            Find trusted {cityName} businesses ready to connect on WhatsApp. Pick a service or browse top-rated.
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">What service do you need in {cityName}?</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${city}/${cat}`}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-200 rounded-xl hover:border-whatsapp/30 hover:shadow-md transition-all text-sm"
                >
                  <span className="capitalize text-surface-700 group-hover:text-whatsapp-dark transition-colors font-medium">
                    {cat.replace(/-/g, ' ')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-whatsapp transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-whatsapp" /> Top Rated in {cityName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.slice(0, 6).map((biz) => (
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
                whatsapp={biz.whatsapp}
                address={biz.address}
                verified={Boolean(biz.verified)}
                featured={Boolean(biz.featured)}
                claimed={Boolean(biz.claimed)}
                rankingScore={biz.ranking_score}
              />
            ))}
          </div>
          {businesses.length > 6 && (
            <div className="text-center mt-6">
              <Link
                href={`/search?city=${city}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-900 text-white font-semibold rounded-xl hover:bg-surface-800 transition-colors text-sm"
              >
                View all {businesses.length} businesses in {cityName} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-surface-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-whatsapp" /> FAQs About {cityName} Services
          </h2>
          <div className="space-y-3">
            {[
              { q: `How do I find a ${categories.length > 0 ? categories[0].replace(/-/g, ' ') : 'service'} in ${cityName}?`, a: `Search on ADZBE for ${cityName} businesses. Browse ratings, read descriptions, and tap "Chat on WhatsApp" to connect instantly — no forms or phone calls required.` },
              { q: `Are the businesses listed in ${cityName} trustworthy?`, a: `All listings are manually reviewed. Look for the "Owner Verified" badge — these businesses have claimed their profile. Check ratings and reviews to make informed decisions.` },
              { q: `Can I list my ${cityName} business for free?`, a: `Yes! Basic listing is free. Add your business and get discovered by customers looking for your services in ${cityName}.` },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-surface-200 overflow-hidden">
                <summary className="px-5 py-4 font-medium text-surface-900 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-surface-400 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <div className="px-5 pb-4 text-sm text-surface-600">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-8 text-center">
            <MessageCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
            <h2 className="text-xl font-bold text-surface-900 mb-2">Own a business in {cityName}?</h2>
            <p className="text-surface-500 text-sm mb-5">Get leads directly on WhatsApp.</p>
            <Link
              href="/add-business"
              className="inline-flex items-center gap-2 px-6 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors shadow-md shadow-whatsapp/20"
            >
              <Building2 className="w-4 h-4" /> Add Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
