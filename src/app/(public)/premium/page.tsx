import Link from 'next/link'
import { CheckCircle, MessageCircle, TrendingUp, Star, Shield, Zap, Smartphone, BarChart3, HelpCircle, ArrowRight, IndianRupee } from 'lucide-react'

export const metadata = {
  title: 'Pricing & Benefits | ADZBE',
  description: 'Claim your business listing for ₹499 and get more WhatsApp leads. Upgrade to Premium for top ranking and more visibility.',
  alternates: { canonical: 'https://adzbe.cloud/premium' },
  openGraph: {
    title: 'Pricing & Benefits | ADZBE',
    description: 'Claim your business listing for ₹499 and get more WhatsApp leads. Upgrade to Premium.',
    url: 'https://adzbe.cloud/premium',
    siteName: 'ADZBE',
    type: 'website',
    locale: 'en_IN',
  },
}

const faqs = [
  { q: 'What is the ₹499 claim fee?', a: 'It is a one-time fee to verify and claim ownership of your business listing. Once claimed, you can update your business info, respond to reviews, and access basic analytics.' },
  { q: 'How does Premium ranking work?', a: 'Premium businesses appear at the top of all search results, category pages, and city pages. You also get a Featured badge that builds trust with customers.' },
  { q: 'Will I get more WhatsApp leads?', a: 'Yes. Premium listings get 3-5x more WhatsApp clicks on average because they appear first. Every click is tracked and you get real-time WhatsApp notifications.' },
  { q: 'Can I try before upgrading?', a: 'Your free listing is always visible. The ₹499 claim fee unlocks ownership. You can upgrade to Premium anytime to boost your ranking.' },
  { q: 'Is there a contract?', a: 'No. Premium is month-to-month. Cancel anytime. The ₹499 claim is a one-time fee.' },
]

export default function PremiumPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-whatsapp/20 text-whatsapp-light rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> India&apos;s WhatsApp Business Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Turn Clicks Into<br />
            <span className="text-whatsapp-light">Customers</span>
          </h1>
          <p className="text-surface-300 text-lg max-w-2xl mx-auto mb-8">
            Claim your business listing, get found by nearby customers, and receive WhatsApp leads directly to your phone.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/claim" className="inline-flex items-center gap-2 bg-whatsapp text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-whatsapp-dark transition-all shadow-lg shadow-whatsapp/25">
              Claim Your Business — ₹499 <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/search" className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all">
              Find Your Listing
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-surface-900 mb-4">How It Works</h2>
          <p className="text-surface-500 text-center max-w-xl mx-auto mb-12">Three simple steps to start getting WhatsApp leads from customers near you.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Smartphone, title: 'Find Your Listing', desc: 'Search for your business on ADZBE. If it is already listed, claim it. If not, add it for free.' },
              { step: '02', icon: Shield, title: 'Verify & Claim — ₹499', desc: 'Pay a one-time ₹499 fee to verify your ownership. Unlock editing, analytics, and review management.' },
              { step: '03', icon: MessageCircle, title: 'Get WhatsApp Leads', desc: 'Customers find you, tap WhatsApp, and message you directly. Every lead is tracked in your dashboard.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-whatsapp/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-whatsapp" />
                </div>
                <div className="text-whatsapp font-bold text-sm mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{item.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-surface-50" id="pricing">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-surface-900 mb-4">Simple Pricing, Real Results</h2>
          <p className="text-surface-500 text-center max-w-xl mx-auto mb-12">Start with a free listing. Claim for ₹499. Upgrade to Premium for maximum visibility.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl border-2 border-surface-200 p-8 flex flex-col">
              <h3 className="text-lg font-semibold text-surface-900 mb-1">Free</h3>
              <p className="text-3xl font-bold text-surface-900 mb-1">₹0</p>
              <p className="text-surface-400 text-sm mb-6">Listed and visible</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Business listing on ADZBE', 'Basic search visibility', 'Customer reviews', 'WhatsApp contact button'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-surface-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/search" className="block text-center py-3 rounded-xl font-semibold bg-surface-100 text-surface-700 hover:bg-surface-200 transition-colors">
                Find My Listing
              </Link>
            </div>

            {/* Claimed */}
            <div className="bg-white rounded-2xl border-2 border-whatsapp/30 shadow-lg shadow-whatsapp/5 p-8 flex flex-col relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-whatsapp text-white text-sm font-semibold rounded-full whitespace-nowrap">
                Recommended
              </span>
              <h3 className="text-lg font-semibold text-surface-900 mb-1">Claimed</h3>
              <p className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-surface-900">₹499</span>
                <span className="text-surface-400 text-sm">one-time</span>
              </p>
              <p className="text-surface-400 text-sm mb-6">Verified & own your listing</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in Free', 'Verified owner badge', 'Edit your business info', 'Respond to reviews', 'Basic analytics dashboard', 'WhatsApp lead alerts', 'Higher search ranking'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-surface-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-whatsapp shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/claim" className="block text-center py-3 rounded-xl font-semibold bg-whatsapp text-white hover:bg-whatsapp-dark transition-colors shadow-md">
                Claim Now — ₹499
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-2xl border-2 border-brand-200 p-8 flex flex-col">
              <h3 className="text-lg font-semibold text-surface-900 mb-1">Premium</h3>
              <p className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-surface-900">₹499</span>
                <span className="text-surface-400 text-sm">/month</span>
              </p>
              <p className="text-surface-400 text-sm mb-6">Maximum visibility & leads</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in Claimed', 'Featured badge', 'Top of search results', 'Homepage featured spot', 'Priority customer support', 'Photo gallery (up to 10)', 'Social media promotion', 'Lead analytics & insights'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-surface-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/claim" className="block text-center py-3 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-md">
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / ROI */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-surface-900 mb-4">More Visibility. More Leads. More Business.</h2>
          <p className="text-surface-500 text-center max-w-xl mx-auto mb-12">Here is what happens when you claim and upgrade your listing.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: TrendingUp, stat: '3-5x', label: 'More WhatsApp clicks', desc: 'Premium listings appear first. Customers always pick the top result.', color: 'text-whatsapp' },
              { icon: Star, stat: 'Featured', label: 'Badge on your listing', desc: 'The Featured badge builds instant trust. Customers prefer verified businesses.', color: 'text-amber-500' },
              { icon: MessageCircle, stat: 'Real-time', label: 'Lead alerts on WhatsApp', desc: 'Get notified instantly when someone messages you. Never miss a customer.', color: 'text-whatsapp' },
              { icon: BarChart3, stat: 'Dashboard', label: 'Track every lead', desc: 'See how many views, clicks, and calls your listing gets. Know your ROI.', color: 'text-brand-600' },
              { icon: Shield, stat: 'Verified', label: 'Owner badge + control', desc: 'Only you can edit your listing. No more outdated info. Full control.', color: 'text-blue-500' },
              { icon: IndianRupee, stat: '₹499', label: 'One-time fee, lifetime value', desc: 'Pay once to claim. Your listing works for you 24/7. Upgrade anytime.', color: 'text-green-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 p-6 rounded-2xl bg-surface-50 border border-surface-100">
                <div className="w-12 h-12 rounded-xl bg-white border border-surface-200 flex items-center justify-center shrink-0">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold text-surface-900">{item.stat}</span>
                    <span className="text-surface-700 font-medium">{item.label}</span>
                  </div>
                  <p className="text-surface-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Ranking Works */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">How Ranking Works</h2>
          <p className="text-surface-500 mb-10">Your position in search results is determined by these factors:</p>
          <div className="space-y-4 text-left">
            {[
              { label: 'Featured (Premium)', desc: 'Premium listings always appear first — this is the #1 ranking factor.', tier: 'paid', pct: 'Top' },
              { label: 'WhatsApp Clicks', desc: 'The more customers contact you, the higher you rank. Real engagement matters.', tier: 'organic', pct: 'High' },
              { label: 'Rating & Reviews', desc: 'Higher-rated businesses with more reviews get a ranking boost.', tier: 'organic', pct: 'Medium' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between p-4 bg-white rounded-xl border border-surface-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-surface-900 text-sm">{f.label}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${f.tier === 'paid' ? 'bg-amber-100 text-amber-700' : 'bg-whatsapp/10 text-whatsapp-dark'}`}>
                      {f.tier === 'paid' ? 'Premium' : 'Organic'}
                    </span>
                  </div>
                  <p className="text-surface-500 text-xs">{f.desc}</p>
                </div>
                <div className={`text-sm font-bold ml-4 ${f.tier === 'paid' ? 'text-amber-600' : 'text-whatsapp-dark'}`}>{f.pct}</div>
              </div>
            ))}
          </div>
          <p className="text-surface-400 text-sm mt-6">New listings start with a 3.5 rating and rise quickly with real WhatsApp engagement.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-surface-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-surface-500 text-center max-w-xl mx-auto mb-12">Everything you need to know about claiming and promoting your business.</p>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-surface-50 rounded-xl border border-surface-200 [&[open]]:border-whatsapp/20">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-surface-900 font-medium text-sm list-none">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-whatsapp shrink-0" />
                    {faq.q}
                  </div>
                  <ArrowRight className="w-4 h-4 text-surface-400 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <div className="px-4 pb-4 pt-0 text-surface-500 text-sm leading-relaxed border-t border-surface-200 mt-0 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-whatsapp to-whatsapp-dark text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get More Customers?</h2>
          <p className="text-white/80 mb-8 text-lg">Join thousands of businesses using ADZBE to get WhatsApp leads every day.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/claim" className="inline-flex items-center gap-2 bg-white text-whatsapp-dark px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-surface-100 transition-all shadow-lg">
              Claim Your Business <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/search" className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
