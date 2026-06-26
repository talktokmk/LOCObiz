import { db } from '@/lib/db'
import { states } from '@/lib/states'

export const revalidate = 3600

export default async function sitemap() {
  const baseUrl = 'https://adzbe.cloud'

  const categoriesResult = await db.execute('SELECT slug FROM categories')
  const categories = categoriesResult.rows as unknown as { slug: string }[]

  const businessesResult = await db.execute("SELECT slug, updated_at FROM businesses WHERE status = 'approved'")
  const businesses = businessesResult.rows as unknown as { slug: string; updated_at: string }[]

  const citiesResult = await db.execute("SELECT DISTINCT city FROM businesses WHERE status = 'approved'")
  const cities = citiesResult.rows as unknown as { city: string }[]

  const districtsResult = await db.execute("SELECT DISTINCT state, district FROM businesses WHERE district IS NOT NULL AND status = 'approved'")
  const districtRows = districtsResult.rows as unknown as { state: string; district: string }[]

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/add-business`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/premium`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/claim`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/refund`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ]

  const statePages = states.map((st) => ({
    url: `${baseUrl}/state/${st.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const districtPages = districtRows.map((d) => ({
    url: `${baseUrl}/state/${d.state}/${d.district.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  const cityPages = cities.map((c) => ({
    url: `${baseUrl}/city/${c.city.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  const categoryCityPages = categories.flatMap((cat) =>
    cities.map((c) => ({
      url: `${baseUrl}/category/${c.city.toLowerCase()}/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  )

  const businessPages = businesses.map((b) => ({
    url: `${baseUrl}/business/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const blogPages = [
    { url: `${baseUrl}/blog/how-to-choose-local-service`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/blog/benefits-local-businesses`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/blog/digital-marketing-small-business`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  return [...staticPages, ...statePages, ...districtPages, ...cityPages, ...categoryPages, ...categoryCityPages, ...businessPages, ...blogPages]
}
