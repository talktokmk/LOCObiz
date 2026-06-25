import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getStateBySlug } from '@/lib/states'
import { ArrowLeft, Building2 } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const st = getStateBySlug(state)
  if (!st) return { title: 'State Not Found' }
  return {
    title: `Businesses in ${st.name}`,
    description: `Find local businesses, services, and shops across all districts of ${st.name}. Browse restaurants, salons, doctors and more in ${st.name}.`,
  }
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const st = getStateBySlug(state)
  if (!st) notFound()

  const districtsResult = await db.execute({
    sql: 'SELECT DISTINCT district FROM businesses WHERE state = ? AND district IS NOT NULL ORDER BY district',
    args: [state],
  })
  const districts = districtsResult.rows as unknown as { district: string }[]

  const totalResult = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM businesses WHERE state = ?',
    args: [state],
  })
  const total = Number((totalResult.rows[0] as Record<string, unknown>).c)

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1 text-brand-200 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{st.name}</h1>
          <p className="text-brand-100">
            {total} businesses across {districts.length} districts
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {districts.map((d) => (
              <Link
                key={d.district}
                href={`/state/${state}/${d.district.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-lg hover:border-brand-300 transition-all"
              >
                <Building2 className="w-8 h-8 text-brand-600 mb-3" />
                <h3 className="font-semibold text-surface-900">{d.district}</h3>
                <p className="text-sm text-surface-500 mt-1">District</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
