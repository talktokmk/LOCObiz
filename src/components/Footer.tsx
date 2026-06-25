import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-surface-800 text-surface-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">LOCObiz</h3>
            <p className="text-sm">Find the best local businesses near you. India's local business directory.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-white transition-colors">Browse Businesses</Link></li>
              <li><Link href="/claim" className="hover:text-white transition-colors">Claim Your Business</Link></li>
              <li><Link href="/premium" className="hover:text-white transition-colors">Premium Listings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">States</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/state/maharashtra" className="hover:text-white transition-colors">Maharashtra</Link></li>
              <li><Link href="/state/karnataka" className="hover:text-white transition-colors">Karnataka</Link></li>
              <li><Link href="/state/tamil-nadu" className="hover:text-white transition-colors">Tamil Nadu</Link></li>
              <li><Link href="/state/delhi" className="hover:text-white transition-colors">Delhi</Link></li>
              <li><Link href="/state/uttar-pradesh" className="hover:text-white transition-colors">Uttar Pradesh</Link></li>
              <li><Link href="/state/gujarat" className="hover:text-white transition-colors">Gujarat</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><a href="mailto:hello@locobiz.in" className="hover:text-white transition-colors">Contact</a></li>
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
