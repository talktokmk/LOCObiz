import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'ADZBE Blog',
  description: 'Tips, guides, and insights for finding and growing local businesses in India.',
}

const posts = [
  {
    slug: 'how-to-choose-local-service',
    title: 'How to Choose the Right Local Service Provider',
    excerpt: 'Tips to help you find and choose the best local service provider for your needs.',
    date: '2026-01-15',
  },
  {
    slug: 'benefits-local-businesses',
    title: 'Benefits of Supporting Local Businesses',
    excerpt: 'Why supporting local businesses matters for your community and economy.',
    date: '2026-01-10',
  },
  {
    slug: 'digital-marketing-small-business',
    title: 'Digital Marketing Tips for Small Businesses',
    excerpt: 'Practical digital marketing strategies for small business owners in India.',
    date: '2026-01-05',
  },
]

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-surface-900 mb-2">ADZBE Blog</h1>
      <p className="text-surface-500 mb-10">Tips, guides, and insights for local businesses in India.</p>
      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-white rounded-xl border border-surface-200 p-6 hover:shadow-lg hover:border-brand-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-surface-900 mb-1">{post.title}</h2>
                <p className="text-surface-500 text-sm">{post.excerpt}</p>
                <p className="text-surface-400 text-xs mt-2">{post.date}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-surface-300 shrink-0 ml-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
