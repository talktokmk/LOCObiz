import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { RANKING_SQL } from '@/lib/ranking'
import BusinessCard from '@/components/BusinessCard'
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd'
import { TrendingUp, Building2, MessageCircle, ChevronRight, HelpCircle, ArrowRight } from 'lucide-react'

export const revalidate = 3600

export async function generateStaticParams() {
  const result = await db.execute("SELECT DISTINCT slug FROM business_services WHERE slug != ''")
  const rows = result.rows as unknown as { slug: string }[]
  return rows.map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const nameResult = await db.execute({
    sql: "SELECT bs.name, GROUP_CONCAT(DISTINCT b.city) as cities FROM business_services bs JOIN businesses b ON b.id = bs.business_id WHERE bs.slug = ? AND b.status = 'approved' GROUP BY bs.name LIMIT 1",
    args: [slug],
  })
  const row = nameResult.rows[0] as unknown as { name: string; cities: string } | undefined
  if (!row) return { title: 'Service Not Found' }

  const serviceName = row.name
  const title = `${serviceName} Services Near You | ADZBE`
  const description = `Find the best ${serviceName.toLowerCase()} services near you. Connect with trusted professionals instantly on WhatsApp.`

  return {
    title,
    description,
    alternates: { canonical: `https://adzbe.cloud/service/${slug}` },
    openGraph: {
      title: `${serviceName} Services | ADZBE`,
      description,
      siteName: 'ADZBE',
      locale: 'en_IN',
    },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const serviceResult = await db.execute({
    sql: "SELECT bs.*, b.name as business_name, b.slug as business_slug FROM business_services bs JOIN businesses b ON b.id = bs.business_id WHERE bs.slug = ? AND b.status = 'approved' LIMIT 1",
    args: [slug],
  })
  const serviceInfo = serviceResult.rows[0] as unknown as { name: string; keywords: string } | undefined
  if (!serviceInfo) notFound()

  const serviceName = serviceInfo.name
  const keywords = (serviceInfo.keywords || serviceName).split(',').map(k => k.trim()).filter(Boolean)
  const keywordTags = keywords.slice(0, 8)

  const businessesResult = await db.execute({
    sql: `SELECT DISTINCT b.slug, b.name, b.category_slug, b.city, b.area, b.district, b.state, b.rating, b.reviews_count, b.phone, b.whatsapp, b.address, b.verified, b.featured, b.claimed, ${RANKING_SQL} as ranking_score FROM businesses b INNER JOIN business_services bs ON bs.business_id = b.id WHERE bs.slug = ? AND b.status = 'approved' ORDER BY ranking_score DESC LIMIT 50`,
    args: [slug],
  })
  const businesses = businessesResult.rows as unknown as {
    slug: string; name: string; category_slug: string; city: string; area: string; district: string; state: string
    rating: number; reviews_count: number; phone: string; whatsapp: string; address: string
    verified: number; featured: number; claimed: number; ranking_score: number
  }[]

  const cities = [...new Set(businesses.map(b => b.city))].slice(0, 10)

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', item: 'https://adzbe.cloud/' },
        { name: `${serviceName} Services`, item: `https://adzbe.cloud/service/${slug}` },
      ]} />
      <FAQJsonLd items={[
        { question: `How do I find ${serviceName.toLowerCase()} services near me?`, answer: `Search on ADZBE for ${serviceName.toLowerCase()} providers. Browse ratings, read descriptions, and tap "Chat on WhatsApp" to connect instantly.` },
        { question: `Are ${serviceName.toLowerCase()} providers on ADZBE verified?`, answer: `Look for the "Owner Verified" badge on listings. These providers have claimed their profile and verified their ownership.` },
        { question: `How quickly will a ${serviceName.toLowerCase()} provider respond?`, answer: `Most providers respond within minutes on WhatsApp. Look for the "Fast Response" badge on listings.` },
      ]} />
      <div>
        <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white capitalize">{serviceName}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 capitalize">{serviceName} Services</h1>
            <p className="text-surface-300 max-w-2xl">
              Find trusted {serviceName.toLowerCase()} providers ready to connect on WhatsApp. Browse top-rated professionals near you.
            </p>
            {keywordTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {keywordTags.map(kw => (
                  <span key={kw} className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs capitalize">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {cities.length > 0 && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Available in these cities</h2>
              <div className="flex flex-wrap gap-2">
                {cities.map(city => (
                  <Link
                    key={city}
                    href={`/search?q=${encodeURIComponent(serviceName)}&city=${encodeURIComponent(city)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-surface-200 rounded-xl hover:border-whatsapp/30 hover:shadow-md transition-all text-sm"
                  >
                    <span className="text-surface-700 font-medium">{serviceName} in {city}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-surface-300" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-whatsapp" /> Top Rated {serviceName} Providers
            </h2>
            {businesses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-surface-200">
                <p className="text-surface-500">No businesses found for this service.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.slice(0, 12).map((biz, i) => (
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
                    rank={i + 1}
                    rankingScore={biz.ranking_score}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-8 text-center">
              <MessageCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
              <h2 className="text-xl font-bold text-surface-900 mb-2">Offer {serviceName} services?</h2>
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
