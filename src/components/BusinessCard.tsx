import Link from 'next/link'
import { Star, MapPin, MessageCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react'

interface BusinessCardProps {
  slug: string
  name: string
  category: string
  city: string
  area?: string
  district?: string
  state?: string
  rating?: number
  reviewsCount?: number
  phone?: string
  verified?: boolean
  featured?: boolean
  rank?: number
}

export default function BusinessCard({
  slug, name, category, city, area, rating, reviewsCount, phone, verified, featured, rank,
}: BusinessCardProps) {
  const waNumber = phone?.replace(/[^0-9]/g, '') || ''

  return (
    <div className="group bg-white rounded-xl border border-surface-200 hover:border-whatsapp/30 hover:shadow-lg hover:shadow-whatsapp/5 transition-all duration-300 animate-fade-in">
      <Link href={`/business/${slug}`} className="block p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {rank && rank <= 3 && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  rank === 1
                    ? 'bg-amber-100 text-amber-700'
                    : rank === 2
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {rank === 1 ? <TrendingUp className="w-3 h-3" /> : null}
                  #{rank} in {city}
                </span>
              )}
              {Boolean(verified) && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-100 text-brand-700 text-[11px] font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
              {Boolean(featured) && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-whatsapp-light text-green-800 text-[11px] font-medium rounded-full">
                  <Zap className="w-3 h-3" /> Featured
                </span>
              )}
            </div>
            <h3 className="font-semibold text-surface-900 group-hover:text-whatsapp-dark transition-colors truncate">
              {name}
            </h3>
          </div>
          {rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-sm text-surface-900">{rating}</span>
              {reviewsCount && <span className="text-xs text-surface-400">({reviewsCount})</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-surface-500 mb-4">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {[area, city].filter(Boolean).join(', ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}?text=Hi%2C%20I%20found%20you%20on%20LOCObiz.%20I%27m%20interested%20in%20your%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-whatsapp text-white font-semibold text-sm rounded-lg hover:bg-whatsapp-dark transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          )}
          <span className="text-xs text-surface-400 capitalize">{category.replace(/-/g, ' ')}</span>
        </div>
      </Link>
    </div>
  )
}
