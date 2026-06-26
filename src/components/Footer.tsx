import Link from 'next/link'
import { db } from '@/lib/db'

export default async function Footer() {
  let cities: { city: string }[] = []
  let categories: { category_slug: string }[] = []
  try {
    const citiesRes = await db.execute("SELECT DISTINCT city FROM businesses WHERE city IS NOT NULL AND status = 'approved' ORDER BY city LIMIT 10")
    cities = citiesRes.rows as unknown as { city: string }[]
    const catRes = await db.execute("SELECT DISTINCT category_slug FROM businesses WHERE category_slug IS NOT NULL AND status = 'approved' ORDER BY category_slug LIMIT 10")
    categories = catRes.rows as unknown as { category_slug: string }[]
  } catch (e) {
    console.error('Footer query failed:', e)
    cities = []
    categories = []
  }

  return (
    <footer className="bg-surface-900 text-surface-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-white mb-3">ADZBE</h3>
            <p className="text-sm leading-relaxed">Find trusted local businesses in your city. Connect instantly via WhatsApp.</p>
            <Link href="/add-business" className="inline-flex items-center gap-1 mt-3 text-whatsapp-light hover:text-whatsapp text-sm font-medium transition-colors">
              Add Your Business &rarr;
            </Link>
            <div className="mt-4 space-y-1.5 text-sm">
              <Link href="/blog" className="block hover:text-white transition-colors">Blog</Link>
              <Link href="/premium" className="block hover:text-white transition-colors">Pricing</Link>
              <Link href="/add-business" className="block hover:text-white transition-colors">List Your Business</Link>
              <Link href="/login" className="block hover:text-white transition-colors">Owner Login</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Popular Cities</h3>
            {cities.length > 0 ? (
              <ul className="space-y-1.5 text-sm">
                {cities.map((c) => (
                  <li key={c.city}>
                    <Link href={`/city/${c.city.toLowerCase()}`} className="hover:text-white transition-colors">
                      {c.city}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-surface-500">No cities yet</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Categories</h3>
            {categories.length > 0 ? (
              <ul className="space-y-1.5 text-sm">
                {categories.map((c) => (
                  <li key={c.category_slug}>
                    <Link href={`/category/${c.category_slug}`} className="hover:text-white transition-colors capitalize">
                      {c.category_slug.replace(/-/g, ' ')}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-surface-500">No categories yet</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Support</h3>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><a href="https://wa.me/918618008168" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Support</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-700 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} ADZBE. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
