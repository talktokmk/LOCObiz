'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-whatsapp flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-surface-900">LOCObiz</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-surface-600">
          <Link href="/" className="hover:text-surface-900 transition-colors">Home</Link>
          <Link href="/search" className="hover:text-surface-900 transition-colors">Search</Link>
        </nav>
      </div>
    </header>
  )
}
