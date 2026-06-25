import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Star, MapPin, Phone, Globe, Clock, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await db.execute({ sql: 'SELECT * FROM businesses WHERE slug = ?', args: [slug] })
  const biz = result.rows[0] as unknown as { name: string; description: string; city: string; area: string; slug: string } | undefined
  if (!biz) return { title: 'Business Not Found' }
  return {
    title: `${biz.name} - ${biz.area}, ${biz.city}`,
    description: biz.description?.slice(0, 160) || `${biz.name} in ${biz.area}, ${biz.city}. Contact, reviews, and more.`,
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

  await db.execute({
    sql: 'UPDATE businesses SET views = views + 1 WHERE id = ?',
    args: [biz.id],
  })

  const services = biz.services ? JSON.parse(biz.services) : []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/" className="text-brand-600 hover:text-brand-700">Home</Link>
        <span className="text-surface-300">/</span>
        <Link href={`/state/${biz.state}`} className="text-brand-600 hover:text-brand-700 capitalize">{biz.state?.replace(/-/g, ' ')}</Link>
        {biz.district && (
          <>
            <span className="text-surface-300">/</span>
            <Link href={`/state/${biz.state}/${biz.district.toLowerCase().replace(/\s+/g, '-')}`} className="text-brand-600 hover:text-brand-700">{biz.district}</Link>
          </>
        )}
        <span className="text-surface-300">/</span>
        <Link href={`/city/${biz.city.toLowerCase()}`} className="text-brand-600 hover:text-brand-700">{biz.city}</Link>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{biz.name}</h1>
              {Boolean(biz.verified) && (
                <span className="flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 text-xs font-medium rounded">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-surface-500 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{biz.area}, {biz.city}{biz.district ? `, ${biz.district}` : ''}{biz.state ? `, ${biz.state.replace(/-/g, ' ')}` : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium text-surface-900">{biz.rating}</span>
                <span>({biz.reviews_count} reviews)</span>
              </div>
            </div>
          </div>
          {biz.whatsapp && (
            <a
              href={`https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shrink-0"
            >
              <ExternalLink className="w-4 h-4" /> Contact on WhatsApp
            </a>
          )}
          {!biz.whatsapp && biz.phone && (
            <a
              href={`https://wa.me/${biz.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shrink-0"
            >
              <ExternalLink className="w-4 h-4" /> Contact on WhatsApp
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-surface-600">
              <Phone className="w-4 h-4 text-brand-600" />
              <span>{biz.phone}</span>
            </div>
            {biz.email && (
              <div className="flex items-center gap-2 text-surface-600">
                <Globe className="w-4 h-4 text-brand-600" />
                <span>{biz.email}</span>
              </div>
            )}
            {biz.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-600 shrink-0" />
                <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate">
                  {biz.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-surface-600">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>{biz.address}</span>
            </div>
          </div>
          {services.length > 0 && (
            <div>
              <h3 className="font-semibold text-surface-900 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4 text-brand-600" /> Services
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

      {biz.description && (
        <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 mb-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-3">About</h2>
          <p className="text-surface-600 leading-relaxed">{biz.description}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Owner of this business?</h2>
        <p className="text-surface-500 text-sm mb-4">
          Claim your listing to update information, respond to reviews, and get more visibility.
        </p>
        <Link
          href={`/claim?slug=${biz.slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
        >
          Claim This Listing
        </Link>
      </div>
    </div>
  )
}
