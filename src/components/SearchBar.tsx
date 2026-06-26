'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, X } from 'lucide-react'

interface SearchBarProps {
  initialQuery?: string
  initialCity?: string
  large?: boolean
}

const popularCities = ['Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow']

export default function SearchBar({ initialQuery = '', initialCity = '', large = false }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [city, setCity] = useState(initialCity)
  const [showCities, setShowCities] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCities(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback((q: string, c: string) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (c.trim()) params.set('city', c.trim())
    router.push(`/search?${params.toString()}`)
  }, [router])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    search(query, city)
  }, [query, city, search])

  const selectCity = useCallback((c: string) => {
    setCity(c)
    setShowCities(false)
    if (query.trim()) search(query, c)
  }, [query, search])

  return (
    <form onSubmit={handleSubmit} className={`w-full ${large ? 'max-w-2xl' : 'max-w-xl'}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 ${large ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(e.target.value.length > 0)
            }}
            onFocus={() => setShowSuggestions(query.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search for a business or service..."
            className={`w-full pl-11 pr-4 bg-white border border-surface-300 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-whatsapp/40 focus:border-whatsapp transition-all ${
              large ? 'h-14 text-lg' : 'h-11 text-sm'
            }`}
          />
          {showSuggestions && query && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-surface-200 rounded-xl shadow-lg z-50 p-2">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-surface-700 hover:bg-surface-50 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4 text-surface-400" />
                Search for &ldquo;{query}&rdquo;
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={cityRef}>
          <button
            type="button"
            onClick={() => setShowCities(!showCities)}
            className={`flex items-center justify-center gap-1 px-2 sm:px-4 border border-surface-300 rounded-xl text-surface-600 hover:border-surface-400 transition-colors whitespace-nowrap ${
              large ? 'h-14' : 'h-11 text-sm'
            }`}
          >
            <MapPin className={large ? 'w-5 h-5' : 'w-4 h-4'} />
            <span className="hidden sm:inline">{city || 'City'}</span>
          </button>
          {showCities && (
            <div className="absolute top-full mt-1 right-0 w-48 bg-white border border-surface-200 rounded-xl shadow-lg z-50 p-2 max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => { setCity(''); setShowCities(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-500 hover:bg-surface-50 rounded-lg"
              >
                <X className="w-3.5 h-3.5" /> All Cities
              </button>
              {popularCities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => selectCity(c)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    city === c ? 'bg-whatsapp-light text-green-800 font-medium' : 'text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-surface-400" />
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`inline-flex items-center justify-center px-3 sm:px-6 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors ${
            large ? 'h-14 text-base' : 'h-11 text-sm'
          }`}
        >
          <Search className="sm:hidden w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </form>
  )
}
