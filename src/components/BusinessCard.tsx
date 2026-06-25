import Link from 'next/link'
import { Star, MapPin, Phone, ChevronRight } from 'lucide-react'

interface BusinessCardProps {
  slug: string
  name: string
  category: string
  city: string
  district?: string
  state?: string
  area: string
  rating: number
  reviewsCount: number
  phone: string
  verified: boolean
  featured: boolean
}

export default function BusinessCard({
  slug, name, category, city, district, state, area, rating, reviewsCount, phone, verified, featured,
}: BusinessCardProps) {
  const locationParts = [area, city]
  if (district && state) {
    const stateName = district.replace(/-/g, ' ')
    locationParts.push(stateName)
  }

  return (
    <Link
      href={`/business/${slug}`}
      className={`block bg-white rounded-xl border border-surface-200 p-5 hover:shadow-lg hover:border-brand-300 transition-all ${featured ? 'ring-2 ring-brand-500' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-surface-900 truncate">{name}</h3>
            {verified && (
              <span className="shrink-0 px-1.5 py-0.5 bg-brand-100 text-brand-700 text-xs font-medium rounded">Verified</span>
            )}
            {featured && (
              <span className="shrink-0 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">Featured</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-surface-500 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{area}, {city}{district ? `, ${district}` : ''}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-surface-300 shrink-0" />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-medium text-surface-900">{rating}</span>
          <span className="text-surface-400">({reviewsCount})</span>
        </div>
        <div className="flex items-center gap-1 text-surface-500">
          <Phone className="w-3.5 h-3.5" />
          <span>{phone}</span>
        </div>
        <span className="text-surface-400 capitalize">{category}</span>
      </div>
    </Link>
  )
}
