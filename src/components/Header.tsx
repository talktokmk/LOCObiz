'use client'

import Link from 'next/link'
import { MessageCircle, ChevronDown } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

interface Category { slug: string; name: string }

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="bg-white border-b border-surface-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-whatsapp flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-surface-900">ADZBE</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-surface-600">
          <Link href="/" className="hover:text-surface-900 transition-colors hidden sm:inline">Home</Link>
          <Link href="/search" className="hover:text-surface-900 transition-colors hidden sm:inline">Search</Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="hover:text-surface-900 transition-colors flex items-center gap-1 hidden sm:inline-flex"
            >
              Categories <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && categories.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-surface-200 rounded-xl shadow-lg py-2 max-h-80 overflow-y-auto z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="block px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-whatsapp-dark capitalize transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/add-business" className="inline-flex items-center gap-1 px-3 py-1.5 bg-whatsapp text-white font-medium rounded-lg hover:bg-whatsapp-dark transition-colors text-xs whitespace-nowrap">
            Add Business
          </Link>
        </nav>
      </div>
    </header>
  )
}
