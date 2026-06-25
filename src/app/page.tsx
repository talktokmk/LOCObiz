import Link from 'next/link'
import { db } from '@/lib/db'
import SearchBar from '@/components/SearchBar'
import { WebsiteJsonLd } from '@/components/JsonLd'
import { TrendingUp, Zap, MessageCircle, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  let trending: { category_slug: string; count: number }[] = []
  let topBusinesses: {
    slug: string; name: string; category_slug: string; city: string; area: string; rating: number
    reviews_count: number; phone: string; verified: number
  }[] = []

  try {
    const trendingRes = await db.execute(
      "SELECT category_slug, COUNT(*) as count FROM businesses WHERE category_slug IS NOT NULL GROUP BY category_slug ORDER BY count DESC LIMIT 8"
    )
    trending = trendingRes.rows as unknown as typeof trending

    const topRes = await db.execute(
      "SELECT slug, name, category_slug, city, area, rating, reviews_count, phone, verified FROM businesses ORDER BY rating DESC, reviews_count DESC LIMIT 3"
    )
    topBusinesses = topRes.rows as unknown as typeof topBusinesses
  } catch {}

  return (
    <>
      <WebsiteJsonLd />
      <div>
      <section className="bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-whatsapp/20 text-whatsapp-light rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> India&apos;s Fastest WhatsApp Business Discovery
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Find. Connect. <span className="text-whatsapp-light">Done.</span>
          </h1>
          <p className="text-lg md:text-xl text-surface-300 mb-10 max-w-xl mx-auto">
            Search any service in your city and connect instantly on WhatsApp.
          </p>
          <div className="flex justify-center">
            <SearchBar large />
          </div>
        </div>
      </section>

      {trending.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-whatsapp" /> Trending Services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {trending.map((t) => (
                <Link
                  key={t.category_slug}
                  href={`/search?category=${t.category_slug}`}
                  className="group flex items-center justify-between p-4 bg-white border border-surface-200 rounded-xl hover:border-whatsapp/30 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="font-medium text-surface-900 capitalize group-hover:text-whatsapp-dark transition-colors text-sm">
                      {t.category_slug.replace(/-/g, ' ')}
                    </div>
                    <div className="text-xs text-surface-400">{t.count} available</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-whatsapp transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {topBusinesses.length > 0 && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-whatsapp" /> Top Rated &amp; Ready to Chat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topBusinesses.map((biz, i) => {
                const wa = (biz.phone || '').replace(/[^0-9]/g, '')
                return (
                  <div key={biz.slug} className="bg-white rounded-xl border border-surface-200 p-5 hover:border-whatsapp/40 hover:shadow-lg transition-all animate-fade-in">
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold ring-1 ring-amber-300">
                        <TrendingUp className="w-3 h-3" /> #{i + 1} Top Rated
                      </span>
                      {Boolean(biz.verified) && (
                        <span className="px-1.5 py-0.5 bg-brand-100 text-brand-700 text-[11px] font-medium rounded-full">Verified</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-surface-900 mb-1">{biz.name}</h3>
                    <p className="text-xs text-surface-400 mb-4">{biz.area}, {biz.city}</p>
                    <a
                      href={`https://wa.me/${wa}?text=Hi%2C%20I%20found%20you%20on%20LOCObiz.%20I%27m%20interested%20in%20your%20services.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-whatsapp text-white font-semibold text-sm rounded-xl hover:bg-whatsapp-dark transition-all shadow-md shadow-whatsapp/20"
                    >
                      <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-8 text-center">
            <MessageCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
            <h2 className="text-xl font-bold text-surface-900 mb-2">Own a business?</h2>
            <p className="text-surface-500 text-sm mb-5 max-w-md mx-auto">
              Get listed on LOCObiz and start receiving leads directly on WhatsApp.
            </p>
            <a
              href="https://wa.me/919000000000?text=Hi%2C%20I%20want%20to%20list%20my%20business%20on%20LOCObiz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors shadow-md shadow-whatsapp/20"
            >
              <MessageCircle className="w-4 h-4" /> List Your Business
            </a>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
