import Link from 'next/link'
import { Star, MapPin, MessageCircle, CheckCircle, TrendingUp, Zap, Sparkles } from 'lucide-react'
import { getRankLevel } from '@/lib/ranking'
import { findWaNumber } from '@/lib/utils'

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
  whatsapp?: string
  address?: string
  verified?: boolean
  featured?: boolean
  claimed?: boolean
  rank?: number
  rankingScore?: number
}

export default function BusinessCard({
  slug, name, category, city, area, rating, reviewsCount, phone, whatsapp, address, verified, claimed, rank, rankingScore,
}: BusinessCardProps) {
  const waNumber = findWaNumber(whatsapp, phone, address)
  const waUrl = `https://wa.me/${waNumber}?text=Hi%2C%20I%20found%20you%20on%20ADZBE.%20I%27m%20interested%20in%20your%20services.`
  const rankLevel = rankingScore !== undefined ? getRankLevel(rankingScore) : null

  return (
    <div className="bg-white rounded-xl border border-surface-200 hover:border-whatsapp/40 hover:shadow-lg hover:shadow-whatsapp/10 transition-all duration-300 animate-fade-in overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {rank && rank <= 3 && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              rank === 1
                ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                : rank === 2
                ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-300'
                : 'bg-orange-100 text-orange-700 ring-1 ring-orange-300'
            }`}>
              {rank === 1 ? <TrendingUp className="w-3 h-3" /> : null}
              #{rank} in {city}
            </span>
          )}
          {rankLevel && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-full ${rankLevel.color}`}>
              <Sparkles className="w-3 h-3" /> {rankLevel.label}
            </span>
          )}
          {Boolean(claimed) && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-whatsapp/10 text-whatsapp-dark text-[11px] font-medium rounded-full">
              <CheckCircle className="w-3 h-3" /> Owner Verified
            </span>
          )}
          {Boolean(verified) && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-100 text-brand-700 text-[11px] font-medium rounded-full">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 text-[11px] font-medium rounded-full">
            <Zap className="w-3 h-3" /> Fast Response
          </span>
        </div>

        <div className="flex items-start justify-between gap-3 mb-1">
          <Link
            href={`/business/${slug}`}
            className="font-semibold text-surface-900 hover:text-whatsapp-dark transition-colors truncate"
          >
            {name}
          </Link>
          {rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-sm text-surface-900">{rating}</span>
              {reviewsCount && <span className="text-xs text-surface-400">({reviewsCount})</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-surface-400 mb-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{address || `${area ? area + ', ' : ''}${city}`}</span>
        </div>
        {phone && (
          <div className="flex items-center gap-1 text-xs text-surface-400 mb-4">
            <span className="truncate">{phone}</span>
          </div>
        )}

        {waNumber && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 bg-whatsapp text-white font-bold text-base rounded-xl hover:bg-whatsapp-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-whatsapp/20"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-surface-400 capitalize">{category.replace(/-/g, ' ')}</span>
          <Link
            href={`/business/${slug}`}
            className="text-xs text-surface-500 hover:text-surface-700 transition-colors"
          >
            View details &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
