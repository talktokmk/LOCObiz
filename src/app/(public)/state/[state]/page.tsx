import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getStateBySlug } from '@/lib/states'
import { ArrowRight, ChevronRight, MessageCircle, MapPin, Building2 } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const st = getStateBySlug(state)
  if (!st) return { title: 'State Not Found' }
  return {
    title: `Find Services in ${st.name} | Connect on WhatsApp`,
    description: `Find trusted local services across ${st.name}. Connect with plumbers, electricians, salons, doctors and more via WhatsApp.`,
    alternates: { canonical: `https://adzbe.cloud/state/${state}` },
    openGraph: {
      title: `Services in ${st.name} | ADZBE`,
      description: `Find trusted local services across ${st.name}. Connect instantly on WhatsApp.`,
      url: `https://adzbe.cloud/state/${state}`,
      siteName: 'ADZBE',
      type: 'website',
      locale: 'en_IN',
    },
  }
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const st = getStateBySlug(state)
  if (!st) notFound()

  const districtsResult = await db.execute({
    sql: "SELECT DISTINCT district FROM businesses WHERE state = ? AND district IS NOT NULL AND status = 'approved' ORDER BY district",
    args: [state],
  })
  const districts = districtsResult.rows as unknown as { district: string }[]

  const totalResult = await db.execute({
    sql: "SELECT COUNT(*) as c FROM businesses WHERE state = ? AND status = 'approved'",
    args: [state],
  })
  const total = Number((totalResult.rows[0] as Record<string, unknown>).c)

  return (
    <div>
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-surface-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{st.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Services in {st.name}</h1>
          <p className="text-surface-300">
            {total} trusted services across {districts.length} districts — connect on WhatsApp.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-whatsapp" /> Select your district in {st.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {districts.map((d) => (
              <Link
                key={d.district}
                href={`/state/${state}/${d.district.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex items-center justify-between p-4 bg-white border border-surface-200 rounded-xl hover:border-whatsapp/30 hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="font-medium text-surface-900 group-hover:text-whatsapp-dark transition-colors">{d.district}</h3>
                  <p className="text-xs text-surface-400">Find services</p>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-whatsapp transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-whatsapp/10 to-whatsapp/5 rounded-2xl border border-whatsapp/20 p-8 text-center">
            <MessageCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
            <h2 className="text-xl font-bold text-surface-900 mb-2">Own a business in {st.name}?</h2>
            <p className="text-surface-500 text-sm mb-5">Get leads directly on WhatsApp.</p>
            <Link
              href="/add-business"
              className="inline-flex items-center gap-2 px-6 py-3 bg-whatsapp text-white font-semibold rounded-xl hover:bg-whatsapp-dark transition-colors shadow-md shadow-whatsapp/20"
            >
              <Building2 className="w-4 h-4" /> Add Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
