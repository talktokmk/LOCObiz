import Link from 'next/link'
import { db } from '@/lib/db'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import SearchBar from '@/components/SearchBar'
import EmailCapture from '@/components/EmailCapture'
import { WebsiteJsonLd } from '@/components/JsonLd'
import { RANKING_SQL, getRankLevel } from '@/lib/ranking'
import { findWaNumber } from '@/lib/utils'
import { TrendingUp, Zap, MessageCircle, Sparkles, ArrowRight, Building2, Search, Smartphone, Star, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ADZBE | Find Local Businesses & Connect on WhatsApp',
  description: 'India\'s fastest WhatsApp business discovery platform. Find trusted plumbers, electricians, salons, doctors and more near you. Connect instantly.',
  alternates: { canonical: 'https://adzbe.cloud' },
  openGraph: {
    title: 'ADZBE | Find Local Businesses on WhatsApp',
    description: 'Find trusted local businesses near you. Connect instantly via WhatsApp.',
    siteName: 'ADZBE',
    locale: 'en_IN',
  },
}

export default async function HomePage() {
  let trending: { category_slug: string; count: number }[] = []
  let topBusinesses: {
    slug: string; name: string; category_slug: string; city: string; area: string; rating: number
    reviews_count: number; phone: string; whatsapp: string; address: string; website: string; verified: number; claimed: number; ranking_score: number
  }[] = []
  let totalBiz = 0
  let totalCities = 0
  let totalWaClicks = 0

  try {
    const [trendingRes, topRes, aggRes] = await Promise.all([
      db.execute(
        "SELECT category_slug, COUNT(*) as count FROM businesses WHERE category_slug IS NOT NULL AND status = 'approved' GROUP BY category_slug ORDER BY count DESC LIMIT 8"
      ),
      db.execute(
        `SELECT slug, name, category_slug, city, area, rating, reviews_count, phone, whatsapp, address, website, verified, claimed, ${RANKING_SQL} as ranking_score FROM businesses WHERE status = 'approved' ORDER BY ranking_score DESC LIMIT 3`
      ),
      db.execute(
        "SELECT COUNT(*) as biz_count, COUNT(DISTINCT city) as city_count, COALESCE(SUM(whatsapp_clicks), 0) as wa_total FROM businesses WHERE status = 'approved'"
      ),
    ])
    trending = trendingRes.rows as unknown as typeof trending
    topBusinesses = topRes.rows as unknown as typeof topBusinesses
    const agg = aggRes.rows[0] as Record<string, unknown>
    totalBiz = (agg.biz_count as number) || 0
    totalCities = (agg.city_count as number) || 0
    totalWaClicks = (agg.wa_total as number) || 0
  } catch (e) { console.error('HomePage stats query failed:', e) }

  return (
    <>
      <WebsiteJsonLd />
      <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-whatsapp/20 text-whatsapp-light rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> India&apos;s Fastest WhatsApp Business Discovery
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
            Find Trusted Local Businesses.<br />
            <span className="text-whatsapp-light">Chat Instantly on WhatsApp.</span>
          </h1>
          <p className="text-lg md:text-xl text-surface-300 mb-8 max-w-2xl mx-auto">
            Search verified businesses across India and connect directly without forms, waiting, or unnecessary steps.
          </p>
          <div className="flex justify-center">
            <SearchBar large />
          </div>

          {/* Stats counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-whatsapp-light">{totalBiz.toLocaleString('en-IN')}+</div>
              <div className="text-xs md:text-sm text-surface-400 mt-1">Businesses Listed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-whatsapp-light">{totalCities.toLocaleString('en-IN')}+</div>
              <div className="text-xs md:text-sm text-surface-400 mt-1">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-whatsapp-light">{totalWaClicks.toLocaleString('en-IN')}+</div>
              <div className="text-xs md:text-sm text-surface-400 mt-1">WhatsApp Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-whatsapp-light">&lt; 5 min</div>
              <div className="text-xs md:text-sm text-surface-400 mt-1">Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-surface-900 mb-3">How It Works</h2>
          <p className="text-surface-500 mb-10 max-w-lg mx-auto">Find the right service in three simple steps.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-whatsapp/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-whatsapp" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">1. Search</h3>
              <p className="text-sm text-surface-500">Search any service or business in your city. Browse categories or use our smart search.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-whatsapp/10 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-whatsapp" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">2. Browse</h3>
              <p className="text-sm text-surface-500">Compare ratings, read descriptions, and find the right business for your needs.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-whatsapp/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-whatsapp" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-2">3. Connect</h3>
              <p className="text-sm text-surface-500">Tap once to start chatting on WhatsApp. No calls, no forms, no waiting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Services */}
      {trending.length > 0 && (
        <section className="py-12 bg-surface-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-whatsapp" /> Trending Services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {trending.map((t) => (
                <Link
                  key={t.category_slug}
                  href={`/category/${t.category_slug}`}
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

      {/* Top Rated */}
      {topBusinesses.length > 0 && (
        <section className="py-12 bg-surface-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-whatsapp" /> Top Rated &amp; Ready to Chat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topBusinesses.map((biz, i) => {
                const wa = findWaNumber(biz.whatsapp, biz.phone, biz.address, biz.website)
                const level = getRankLevel(biz.ranking_score)
                return (
                  <div key={biz.slug} className="bg-white rounded-xl border border-surface-200 p-5 hover:border-whatsapp/40 hover:shadow-lg transition-all animate-fade-in">
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold ring-1 ring-amber-300">
                        <TrendingUp className="w-3 h-3" /> #{i + 1} Top Rated
                      </span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-full ${level.color}`}>
                        <Sparkles className="w-3 h-3" /> {level.label}
                      </span>
                      {Boolean(biz.claimed) && (
                        <span className="px-1.5 py-0.5 bg-whatsapp/10 text-whatsapp-dark text-[11px] font-medium rounded-full">Owner Verified</span>
                      )}
                      {Boolean(biz.verified) && (
                        <span className="px-1.5 py-0.5 bg-brand-100 text-brand-700 text-[11px] font-medium rounded-full">Verified</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-surface-900 mb-1">{biz.name}</h3>
                    <p className="text-xs text-surface-400 mb-4">{biz.area}, {biz.city}</p>
                    {wa && (
                      <a
                        href={`https://wa.me/${wa}?text=Hi%2C%20I%20found%20you%20on%20ADZBE.%20I%27m%20interested%20in%20your%20services.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-whatsapp text-white font-semibold text-sm rounded-xl hover:bg-whatsapp-dark transition-all shadow-md shadow-whatsapp/20"
                      >
                        <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-surface-900 mb-3">What Business Owners Say</h2>
          <p className="text-surface-500 mb-10 max-w-lg mx-auto">Real results from real businesses on ADZBE.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-50 rounded-xl p-6 text-left">
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-surface-600 mb-4">&ldquo;Got 3 new customers within the first week of listing. The WhatsApp integration is seamless.&rdquo;</p>
              <div className="text-sm font-semibold text-surface-900">— Rajesh K., Plumber</div>
              <div className="text-xs text-surface-400">Bengaluru</div>
            </div>
            <div className="bg-surface-50 rounded-xl p-6 text-left">
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-surface-600 mb-4">&ldquo;Simple to set up and customers find me instantly. Much better than other directories.&rdquo;</p>
              <div className="text-sm font-semibold text-surface-900">— Priya S., Salon Owner</div>
              <div className="text-xs text-surface-400">Mumbai</div>
            </div>
            <div className="bg-surface-50 rounded-xl p-6 text-left">
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-surface-600 mb-4">&ldquo;Premium listing pays for itself. I&rsquo;m getting leads every single day on WhatsApp.&rdquo;</p>
              <div className="text-sm font-semibold text-surface-900">— Amit V., Electrician</div>
              <div className="text-xs text-surface-400">Delhi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-16 bg-whatsapp/5">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-surface-900 mb-2">Get Notified</h2>
          <p className="text-sm text-surface-500 mb-6">Be the first to know when new businesses join your city.</p>
          <form action="/api/subscribe" method="POST" className="flex flex-col sm:flex-row gap-3 hidden">
          </form>
          <EmailCapture />
        </div>
      </section>

      {/* Business Owner CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-8 text-center">
            <MessageCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
            <h2 className="text-xl font-bold text-surface-900 mb-2">Own a business?</h2>
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

      {/* FAQ */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-surface-900 text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q: 'How do I find a business on ADZBE?', a: 'Simply use the search bar above or browse categories. Enter a service name and your city, then browse matching businesses.' },
              { q: 'Is it free to list my business?', a: 'Yes! Basic listings are completely free. You only pay ₹499 one-time to claim and verify ownership, or ₹499/month for Premium placement.' },
              { q: 'How do I contact a business?', a: 'Click the "Chat on WhatsApp" button on any listing. It opens a pre-filled WhatsApp chat instantly — no forms or phone calls required.' },
              { q: 'How do I know a business is reliable?', a: 'Look for Verified badges, ratings, and reviews. Premium and Claimed businesses have verified ownership information.' },
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
    </div>
    </>
  )
}
