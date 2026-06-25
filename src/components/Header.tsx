import Link from 'next/link'
import { MapPin, Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-brand-600" />
            <span className="text-xl font-bold text-surface-900">LOCObiz</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-surface-600 hover:text-surface-900 text-sm font-medium">
              Browse All
            </Link>
            <Link href="/state/maharashtra" className="text-surface-600 hover:text-surface-900 text-sm font-medium">
              States
            </Link>
            <Link href="/claim" className="text-surface-600 hover:text-surface-900 text-sm font-medium">
              Claim Business
            </Link>
            <Link href="/premium" className="text-surface-600 hover:text-surface-900 text-sm font-medium">
              Premium
            </Link>
          </nav>
          <Link
            href="/search"
            className="flex items-center gap-2 text-surface-400 hover:text-surface-600 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Search</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
