'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Store, MessageSquare, FileText, LogOut, MapPin, Menu, X, Upload, Search, Tags } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ username: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((data) => {
        setSession(data)
        setLoading(false)
      })
      .catch(() => {
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
        setLoading(false)
      })
  }, [pathname, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-surface-50">Loading...</div>
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!session) {
    return null
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/businesses', label: 'Businesses', icon: Store },
    { href: '/admin/leads', label: 'Leads', icon: MessageSquare },
    { href: '/admin/claims', label: 'Claims', icon: FileText },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/scraper', label: 'Scraper', icon: Search },
    { href: '/admin/import', label: 'Import', icon: Upload },
  ]

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-surface-50">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-900 text-surface-300 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 text-white">
            <MapPin className="w-6 h-6" />
            <span className="text-lg font-bold">LOCObiz Admin</span>
          </Link>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-brand-600 text-white' : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-400">{session.username}</span>
            <button onClick={handleLogout} className="p-2 text-surface-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-surface-200 px-4 h-14 flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="text-surface-600">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-semibold text-surface-900">LOCObiz Admin</span>
        </div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-surface-900" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 flex justify-end">
                <button onClick={() => setSidebarOpen(false)} className="text-surface-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-4 mb-4">
                <Link href="/admin" className="flex items-center gap-2 text-white" onClick={() => setSidebarOpen(false)}>
                  <MapPin className="w-6 h-6" />
                  <span className="text-lg font-bold">LOCObiz Admin</span>
                </Link>
              </div>
              <nav className="px-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active ? 'bg-brand-600 text-white' : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
