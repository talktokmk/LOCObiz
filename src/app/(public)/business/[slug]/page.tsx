import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Star, MapPin, Phone, Globe, Clock, CheckCircle, MessageCircle, ChevronRight, TrendingUp, Shield, Zap, HelpCircle } from 'lucide-react'
import { LocalBusinessJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd'
import TrackedWaButton from '@/components/TrackedWaButton'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await db.execute({ sql: "SELECT * FROM businesses WHERE slug = ? AND status = 'approved'", args: [slug] })
  const biz = result.rows[0] as unknown as { name: string; description: string; city: string; area: string; slug: string; meta_title: string; meta_description: string; rating: number; reviews_count: number } | undefined
  if (!biz) return { title: 'Business Not Found' }
  const title = biz.meta_title || `${biz.name} - ${biz.area}, ${biz.city}`
  const description = biz.meta_description || biz.description?.slice(0, 160) || `${biz.name} in ${biz.area}, ${biz.city}. Contact via WhatsApp for quick response.`
  return {
    title,
    description,
    alternates: { canonical: `https://adzbe.cloud/business/${slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'ADZBE',
      locale: 'en_IN',
    },
  }
}

const faqs: Record<string, { q: string; a: string }[]> = {
  'plumber': [
    { q: 'Do you handle emergency plumbing?', a: 'Contact the business directly on WhatsApp to check for emergency availability and response times.' },
    { q: 'What areas do you serve?', a: 'The business serves the listed city and surrounding areas. Chat on WhatsApp to confirm service availability in your location.' },
  ],
  'electrician': [
    { q: 'Do you offer emergency electrical services?', a: 'Contact the business on WhatsApp to check for emergency service availability and current response times.' },
    { q: 'Are you licensed and insured?', a: 'Chat directly with the business on WhatsApp to verify their credentials and insurance coverage.' },
  ],
  'salon': [
    { q: 'Do I need an appointment?', a: 'It\'s recommended to book in advance. Chat on WhatsApp to check availability and book your slot.' },
    { q: 'What safety measures do you follow?', a: 'Contact the business on WhatsApp to ask about their hygiene and safety protocols.' },
  ],
  'doctor': [
    { q: 'Do you accept walk-ins?', a: 'Contact the clinic on WhatsApp to check if walk-ins are accepted or if an appointment is needed.' },
    { q: 'What are your consultation hours?', a: 'Chat on WhatsApp with the clinic to get their exact consultation timings and availability.' },
  ],
  'restaurant': [
    { q: 'Do you offer home delivery?', a: 'Contact the restaurant on WhatsApp to check delivery availability and minimum order requirements.' },
    { q: 'Do you have vegetarian options?', a: 'Chat on WhatsApp with the restaurant to ask about their menu and dietary options.' },
  ],
}

function getFaqs(category: string): { q: string; a: string }[] {
  const matched = faqs[category.toLowerCase()]
  if (matched) return matched
  return [
    { q: 'Is this service available right now?', a: 'Chat on WhatsApp with the business to check current availability and response times.' },
    { q: 'Do you serve my area?', a: 'Contact the business directly on WhatsApp to confirm if they serve your specific location.' },
    { q: 'What are your business hours?', a: 'Chat on WhatsApp to get accurate business hours and the best time to reach them.' },
  ]
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await db.execute({ sql: "SELECT * FROM businesses WHERE slug = ? AND status = 'approved'", args: [slug] })
  const biz = result.rows[0] as unknown as {
    id: number; slug: string; name: string; category_slug: string; city: string; district: string; state: string; area: string
    address: string; phone: string; email: string; website: string; whatsapp: string
    description: string; services: string; rating: number; reviews_count: number
    price_range: string; opening_hours: string; verified: number; featured: number
    latitude: number; longitude: number; place_id: string; image_url: string; images: string
    upvotes: number; views: number; claimed: number
  } | undefined

  if (!biz) notFound()

  await db.execute({ sql: 'UPDATE businesses SET views = views + 1 WHERE id = ?', args: [biz.id] })

  const services = biz.services ? JSON.parse(biz.services) : []
  const waNumber = (biz.whatsapp || biz.phone || '').replace(/[^0-9]/g, '')
  const waUrl = `https://wa.me/${waNumber}?text=Hi%2C%20I%20found%20you%20on%20ADZBE.%20I%27m%20interested%20in%20your%20services.`

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...(biz.city ? [{ label: biz.city, href: `/city/${biz.city.toLowerCase()}` }] : []),
    ...(biz.category_slug ? [{ label: biz.category_slug.replace(/-/g, ' '), href: `/category/${biz.city.toLowerCase()}/${biz.category_slug}` }] : []),
  ]

  const categoryFaqs = getFaqs(biz.category_slug || '')

  const ldAddress = {
    streetAddress: biz.address || undefined,
    addressLocality: biz.city,
    addressRegion: biz.state?.replace(/-/g, ' ') || undefined,
    addressCountry: 'IN',
  }

  const ldRating = biz.rating ? {
    ratingValue: biz.rating,
    reviewCount: biz.reviews_count || 0,
  } : undefined

  const breadcrumbItems = breadcrumbs.map((b) => ({
    name: b.label,
    item: `https://adzbe.cloud${b.href}`,
  }))

  const faqItems = categoryFaqs.map((f) => ({
    question: f.q,
    answer: f.a,
  }))

  return (
    <>
      <LocalBusinessJsonLd
        data={{
          name: biz.name,
          description: biz.description || undefined,
          telephone: biz.phone || undefined,
          address: ldAddress,
          aggregateRating: ldRating,
          url: `https://adzbe.cloud/business/${biz.slug}`,
        }}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FAQJsonLd items={faqItems} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 md:pb-8">
        <nav className="flex items-center gap-1.5 text-sm text-surface-400 mb-6 flex-wrap">
          {breadcrumbs.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              {i < breadcrumbs.length - 1 ? (
                <Link href={b.href} className="hover:text-surface-600 transition-colors capitalize">{b.label}</Link>
              ) : null}
            </span>
          ))}
        </nav>

        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden animate-fade-in mb-4">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{biz.name}</h1>
              {Boolean(biz.verified) && (
                <span className="flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 text-xs font-medium rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
              <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                <Zap className="w-3.5 h-3.5" /> Fast Response
              </span>
            </div>

            <div className="flex items-center gap-4 text-surface-500 flex-wrap text-sm mb-6">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{biz.area}, {biz.city}</span>
              </div>
              {biz.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-medium text-surface-900">{biz.rating}</span>
                  <span className="text-surface-400">({biz.reviews_count} reviews)</span>
                </div>
              )}
            </div>

            <TrackedWaButton
              href={waUrl}
              businessId={biz.id}
              phone={waNumber}
              businessName={biz.name}
              label="Chat on WhatsApp Now"
              size="lg"
              pulse
              fullWidth
            />
            <p className="text-center text-sm text-surface-400 flex items-center justify-center gap-1 mt-3">
              <Zap className="w-4 h-4 text-green-500" /> Usually responds within a few minutes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 animate-slide-up">
          <div className="bg-white rounded-xl border border-surface-200 p-4 text-center">
            <MessageCircle className="w-6 h-6 text-whatsapp mx-auto mb-1.5" />
            <h3 className="font-semibold text-xs text-surface-900">Instant Connect</h3>
            <p className="text-[11px] text-surface-400 mt-0.5">1 tap to chat</p>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-4 text-center">
            <Shield className="w-6 h-6 text-whatsapp mx-auto mb-1.5" />
            <h3 className="font-semibold text-xs text-surface-900">Trusted</h3>
            <p className="text-[11px] text-surface-400 mt-0.5">Verified contact</p>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-4 text-center">
            <TrendingUp className="w-6 h-6 text-whatsapp mx-auto mb-1.5" />
            <h3 className="font-semibold text-xs text-surface-900">Top Rated</h3>
            <p className="text-[11px] text-surface-400 mt-0.5">{biz.rating} stars</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 mb-4 animate-slide-up">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-3 text-surface-600">
              <Phone className="w-4 h-4 text-whatsapp shrink-0" />
              <span>{biz.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-surface-600">
              <MapPin className="w-4 h-4 text-whatsapp shrink-0" />
              <span>{biz.address || `${biz.area}, ${biz.city}`}</span>
            </div>
            {(biz.place_id || (biz.latitude && biz.longitude)) && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-whatsapp shrink-0 opacity-0" />
                <a
                  href={biz.place_id ? `https://www.google.com/maps/place/?q=place_id:${biz.place_id}` : `https://www.google.com/maps?q=${biz.latitude},${biz.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 hover:underline"
                >
                  View on Google Maps &rarr;
                </a>
              </div>
            )}
            {biz.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-whatsapp shrink-0" />
                <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate">
                  {biz.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {(() => {
          let bizImages: string[] = []
          try { const p = JSON.parse(biz.images); if (Array.isArray(p)) bizImages = p } catch {}
          if (biz.image_url) bizImages = [biz.image_url, ...bizImages]
          if (bizImages.length > 0) {
            return (
              <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 mb-4 animate-slide-up">
                <h2 className="text-lg font-semibold text-surface-900 mb-3">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {bizImages.slice(0, 6).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`${biz.name} photo ${i + 1}`}
                        className="w-full h-32 md:h-40 object-cover rounded-xl hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )
          }
          return null
        })()}

        {!biz.claimed && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-2xl border border-amber-200 p-6 md:p-8 mb-4 animate-slide-up">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-surface-900 mb-1">Own this business?</h2>
                <p className="text-sm text-surface-600 mb-4">Claim your listing to verify ownership, update your information, and get more customers.</p>
                <Link
                  href={`/claim?slug=${biz.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-whatsapp text-white font-semibold text-sm rounded-xl hover:bg-whatsapp-dark transition-colors shadow-md shadow-whatsapp/20"
                >
                  <CheckCircle className="w-4 h-4" /> Claim This Business — ₹499
                </Link>
              </div>
            </div>
          </div>
        )}

        {biz.description && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 mb-4 animate-slide-up">
            <h2 className="text-lg font-semibold text-surface-900 mb-3">About {biz.name}</h2>
            <p className="text-surface-600 leading-relaxed">{biz.description}</p>
          </div>
        )}

        {services.length > 0 && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 mb-4 animate-slide-up">
            <h2 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-whatsapp" /> Services Offered
            </h2>
            <div className="flex flex-wrap gap-2">
              {services.map((s: string) => (
                <span key={s} className="px-3 py-1.5 bg-surface-100 text-surface-700 rounded-lg text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 mb-4 animate-slide-up">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-whatsapp" /> Quick Questions
          </h2>
          <div className="space-y-3">
            {categoryFaqs.map((faq, i) => (
              <details key={i} className="group bg-surface-50 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 text-sm font-medium text-surface-900 cursor-pointer hover:bg-surface-100 transition-colors">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-surface-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-3 text-sm text-surface-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
          <div className="mt-4 text-center">
            <TrackedWaButton
              href={waUrl}
              businessId={biz.id}
              phone={waNumber}
              businessName={biz.name}
              label="Ask more questions on WhatsApp"
              size="sm"
              fullWidth={false}
              className="inline-flex w-auto px-6"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-6 md:p-8 text-center">
          <h2 className="text-xl font-bold text-surface-900 mb-2">Need help right now?</h2>
          <p className="text-surface-600 mb-5">Chat directly with {biz.name} on WhatsApp — get a response in minutes.</p>
          <TrackedWaButton
            href={waUrl}
            businessId={biz.id}
            phone={waNumber}
            businessName={biz.name}
            label="Chat on WhatsApp Now"
            size="md"
            pulse
            fullWidth={false}
            className="inline-flex w-auto px-8"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 p-3 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <TrackedWaButton
          href={waUrl}
          businessId={biz.id}
          phone={waNumber}
          businessName={biz.name}
          label="Chat on WhatsApp"
          size="md"
          pulse
          fullWidth
        />
      </div>
    </>
  )
}
