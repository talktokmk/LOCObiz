import Link from 'next/link'
import { db } from '@/lib/db'

export default async function Footer() {
  let cities: { city: string }[] = []
  let categories: { category_slug: string }[] = []
  try {
    const citiesRes = await db.execute('SELECT DISTINCT city FROM businesses WHERE city IS NOT NULL ORDER BY city LIMIT 10')
    cities = citiesRes.rows as unknown as { city: string }[]
    const catRes = await db.execute('SELECT DISTINCT category_slug FROM businesses WHERE category_slug IS NOT NULL ORDER BY category_slug LIMIT 10')
    categories = catRes.rows as unknown as { category_slug: string }[]
  } catch {}

  return (
    <footer className="bg-surface-900 text-surface-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-white mb-3">LOCObiz</h3>
            <p className="text-sm">Find trusted local businesses in your city. Connect instantly via WhatsApp.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Popular Cities</h3>
            <ul className="space-y-1.5 text-sm">
              {cities.map((c) => (
                <li key={c.city}>
                  <Link href={`/city/${c.city.toLowerCase()}`} className="hover:text-white transition-colors">
                    {c.city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Categories</h3>
            <ul className="space-y-1.5 text-sm">
              {categories.map((c) => (
                <li key={c.category_slug}>
                  <Link href={`/search?category=${c.category_slug}`} className="hover:text-white transition-colors capitalize">
                    {c.category_slug.replace(/-/g, ' ')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-700 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} LOCObiz. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
