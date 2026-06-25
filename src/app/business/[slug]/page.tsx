import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Star, MapPin, Phone, Globe, Clock, CheckCircle, MessageCircle, ChevronRight, TrendingUp, Shield, Zap } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await db.execute({ sql: 'SELECT * FROM businesses WHERE slug = ?', args: [slug] })
  const biz = result.rows[0] as unknown as { name: string; description: string; city: string; area: string; slug: string } | undefined
  if (!biz) return { title: 'Business Not Found' }
  return {
    title: `${biz.name} - ${biz.area}, ${biz.city}`,
    description: biz.description?.slice(0, 160) || `${biz.name} in ${biz.area}, ${biz.city}. Contact via WhatsApp for quick response.`,
  }
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await db.execute({ sql: 'SELECT * FROM businesses WHERE slug = ?', args: [slug] })
  const biz = result.rows[0] as unknown as {
    id: number; slug: string; name: string; category_slug: string; city: string; district: string; state: string; area: string
    address: string; phone: string; email: string; website: string; whatsapp: string
    description: string; services: string; rating: number; reviews_count: number
    price_range: string; opening_hours: string; verified: number; featured: number
    latitude: number; longitude: number; image_url: string; images: string
    upvotes: number; views: number
  } | undefined

  if (!biz) notFound()

  await db.execute({ sql: 'UPDATE businesses SET views = views + 1 WHERE id = ?', args: [biz.id] })

  const services = biz.services ? JSON.parse(biz.services) : []
  const waNumber = (biz.whatsapp || biz.phone || '').replace(/[^0-9]/g, '')
  const waUrl = `https://wa.me/${waNumber}?text=Hi%2C%20I%20found%20you%20on%20LOCObiz.%20I%27m%20interested%20in%20your%20services.`

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...(biz.state ? [{ label: biz.state.replace(/-/g, ' '), href: `/state/${biz.state}` }] : []),
    ...(biz.district ? [{ label: biz.district, href: `/state/${biz.state}/${biz.district.toLowerCase().replace(/\s+/g, '-')}` }] : []),
    { label: biz.city, href: `/city/${biz.city.toLowerCase()}` },
    { label: biz.name, href: '#' },
  ]

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8">
        <nav className="flex items-center gap-1.5 text-sm text-surface-400 mb-6 flex-wrap">
          {breadcrumbs.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              {i < breadcrumbs.length - 1 ? (
                <Link href={b.href} className="hover:text-surface-600 transition-colors capitalize">{b.label}</Link>
              ) : (
                <span className="text-surface-600 truncate max-w-[200px]">{b.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden animate-fade-in">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{biz.name}</h1>
                  {Boolean(biz.verified) && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                  {Boolean(biz.featured) && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-whatsapp-light text-green-800 text-xs font-medium rounded-full">
                      <Zap className="w-3.5 h-3.5" /> Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-surface-500 flex-wrap text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{biz.area}, {biz.city}</span>
                  </div>
                  {biz.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-surface-900">{biz.rating}</span>
                      <span>({biz.reviews_count} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-surface-600">
                  <Phone className="w-4 h-4 text-whatsapp" />
                  <span>{biz.phone}</span>
                </div>
                {biz.email && (
                  <div className="flex items-center gap-2 text-surface-600">
                    <Globe className="w-4 h-4 text-whatsapp" />
                    <span>{biz.email}</span>
                  </div>
                )}
                {biz.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-whatsapp shrink-0" />
                    <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate">
                      {biz.website}
                    </a>
                  </div>
                )}
              </div>
              {services.length > 0 && (
                <div>
                  <h3 className="font-semibold text-surface-900 mb-2 flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-whatsapp" /> Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-surface-100 text-surface-700 rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 md:px-8 pb-6 md:pb-8">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-whatsapp text-white font-bold text-lg rounded-xl hover:bg-whatsapp-dark hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-whatsapp/25 animate-pulse-whatsapp"
            >
              <MessageCircle className="w-6 h-6" />
              Chat on WhatsApp
            </a>
            <p className="text-xs text-surface-400 text-center mt-2">Usually responds within minutes</p>
          </div>
        </div>

        {biz.description && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 mt-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-surface-900 mb-3">About</h2>
            <p className="text-surface-600 leading-relaxed">{biz.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-slide-up">
          <div className="bg-white rounded-xl border border-surface-200 p-5 text-center">
            <Shield className="w-8 h-8 text-whatsapp mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-surface-900">Trusted Business</h3>
            <p className="text-xs text-surface-500 mt-1">Verified listing with real contact info</p>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-5 text-center">
            <MessageCircle className="w-8 h-8 text-whatsapp mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-surface-900">Instant Connect</h3>
            <p className="text-xs text-surface-500 mt-1">Chat directly on WhatsApp with one tap</p>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-5 text-center">
            <TrendingUp className="w-8 h-8 text-whatsapp mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-surface-900">Top Rated</h3>
            <p className="text-xs text-surface-500 mt-1">{biz.rating} stars from {biz.reviews_count} reviews</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 mt-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-3">Owner of this business?</h2>
          <p className="text-surface-500 text-sm mb-4">
            Claim your listing to update information, respond to reviews, and get more visibility.
          </p>
          <Link
            href={`/claim?slug=${biz.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-900 text-white font-semibold rounded-xl hover:bg-surface-800 transition-colors"
          >
            Claim This Listing
          </Link>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 p-3 md:hidden z-50">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-whatsapp text-white font-bold rounded-xl hover:bg-whatsapp-dark transition-colors shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
          Chat on WhatsApp
        </a>
      </div>
    </>
  )
}
