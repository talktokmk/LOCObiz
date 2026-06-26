'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Building2, LayoutDashboard, Edit3, MessageCircle, LogOut, Menu, X } from 'lucide-react'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [owner, setOwner] = useState<{ name: string; phone: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/owner/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.owner) setOwner(data.owner)
        else router.push('/owner/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    await fetch('/api/owner/logout', { method: 'POST' })
    router.push('/owner/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-surface-500">Loading...</div>
  }

  if (!owner) return null

  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/edit', label: 'Edit Business', icon: Edit3 },
    { href: '/dashboard/leads', label: 'Leads', icon: MessageCircle },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-surface-900">
            <Building2 className="w-5 h-5 text-whatsapp" /> ADZBE
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-whatsapp/10 text-whatsapp-dark' : 'text-surface-600 hover:bg-surface-100'}`}>
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-surface-500">{owner.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-surface-100 rounded-lg">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-surface-200 px-4 py-3 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive(item.href) ? 'bg-whatsapp/10 text-whatsapp-dark' : 'text-surface-600'}`}>
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
