import Link from 'next/link'
import { CheckCircle, Star, TrendingUp, Shield } from 'lucide-react'

export const metadata = {
  title: 'Premium Listings',
  description: 'Boost your business visibility with LOCObiz premium listings. Get featured, get more customers.',
}

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    features: ['Business listing', 'Basic info', 'Customer reviews', 'Search visibility'],
    cta: 'Get Started',
    href: '/claim',
  },
  {
    name: 'Premium',
    price: '₹499/mo',
    popular: true,
    features: [
      'Featured badge',
      'Top of search results',
      'Priority support',
      'Analytics dashboard',
      'WhatsApp lead alerts',
      'Photo gallery',
    ],
    cta: 'Upgrade Now',
    href: '/claim',
  },
  {
    name: 'Premium Plus',
    price: '₹999/mo',
    features: [
      'All Premium features',
      'Homepage featured spot',
      'Social media promotion',
      'Dedicated account manager',
      'Bulk SMS campaigns',
      'Multiple locations',
    ],
    cta: 'Contact Us',
    href: '/claim',
  },
]

export default function PremiumPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Grow Your Business with LOCObiz</h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto">
            Get more customers, better visibility, and powerful tools to grow your local business.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 p-8 ${plan.popular ? 'border-brand-500 shadow-lg relative' : 'border-surface-200'}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-surface-900 mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-surface-900 mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-surface-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-surface-900 mb-12">Why Go Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Star className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <h3 className="font-semibold text-surface-900 mb-2">More Visibility</h3>
              <p className="text-surface-500 text-sm">Featured businesses appear at the top of search results and on the homepage.</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-10 h-10 text-brand-600 mx-auto mb-4" />
              <h3 className="font-semibold text-surface-900 mb-2">More Leads</h3>
              <p className="text-surface-500 text-sm">Get notified instantly when customers contact you via WhatsApp.</p>
            </div>
            <div className="text-center">
              <Shield className="w-10 h-10 text-brand-600 mx-auto mb-4" />
              <h3 className="font-semibold text-surface-900 mb-2">Trust Badge</h3>
              <p className="text-surface-500 text-sm">Verified and premium badges build trust with potential customers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
