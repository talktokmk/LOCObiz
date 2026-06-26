'use client'

import Link from 'next/link'
import { MessageCircle, ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

interface Category { slug: string; name: string }

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([])
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((e) => console.error('Failed to fetch categories:', e))
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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  function closeMobile() {
    setMobileOpen(false)
    setMobileCatsOpen(false)
  }

  return (
    <header className="bg-white border-b border-surface-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-whatsapp flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-surface-900">ADZBE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4 text-sm text-surface-600">
          <Link href="/" className="hover:text-surface-900 transition-colors">Home</Link>
          <Link href="/search" className="hover:text-surface-900 transition-colors">Search</Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="hover:text-surface-900 transition-colors flex items-center gap-1"
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

        {/* Mobile hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="/add-business" className="inline-flex items-center gap-1 px-3 py-1.5 bg-whatsapp text-white font-medium rounded-lg hover:bg-whatsapp-dark transition-colors text-xs whitespace-nowrap">
            Add Business
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -mr-2 text-surface-600 hover:text-surface-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobile} />
          <div className="absolute top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-4 h-14 border-b border-surface-200">
              <span className="font-bold text-lg text-surface-900">Menu</span>
              <button onClick={closeMobile} className="p-2 -mr-2 text-surface-600 hover:text-surface-900" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              <Link href="/" onClick={closeMobile} className="block px-4 py-3 text-surface-700 font-medium rounded-xl hover:bg-surface-50 hover:text-whatsapp-dark transition-colors">
                Home
              </Link>
              <Link href="/search" onClick={closeMobile} className="block px-4 py-3 text-surface-700 font-medium rounded-xl hover:bg-surface-50 hover:text-whatsapp-dark transition-colors">
                Search
              </Link>
              <button
                onClick={() => setMobileCatsOpen(!mobileCatsOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-surface-700 font-medium rounded-xl hover:bg-surface-50 hover:text-whatsapp-dark transition-colors"
              >
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileCatsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileCatsOpen && (
                <div className="ml-4 space-y-0.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={closeMobile}
                      className="block px-4 py-2.5 text-sm text-surface-600 rounded-xl hover:bg-surface-50 hover:text-whatsapp-dark capitalize transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {categories.length === 0 && (
                    <p className="px-4 py-2 text-sm text-surface-400">Loading...</p>
                  )}
                </div>
              )}
            </nav>
            <div className="px-4 pb-6 border-t border-surface-200 pt-4">
              <Link
                href="/add-business"
                onClick={closeMobile}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Add Your Business Free
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>
    </header>
  )
}
