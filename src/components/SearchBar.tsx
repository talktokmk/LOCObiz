'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'

interface SearchBarProps {
  initialQuery?: string
  initialCity?: string
}

export default function SearchBar({ initialQuery = '', initialCity = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [city, setCity] = useState(initialCity)
  const router = useRouter()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (city) params.set('city', city)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>
      <div className="relative sm:w-48">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
      >
        Search
      </button>
    </form>
  )
}
