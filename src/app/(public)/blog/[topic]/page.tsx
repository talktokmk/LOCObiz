import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const blogTopics: Record<string, { title: string; content: string }> = {
  'how-to-choose-local-service': {
    title: 'How to Choose the Right Local Service Provider',
    content: `Finding the right local service provider can be challenging. Here are some tips to help you make the best choice.

1. Check Reviews and Ratings
Look for businesses with high ratings and genuine reviews from real customers. ADZBE provides verified ratings to help you make informed decisions.

2. Verify Credentials
Always choose verified businesses. Verified listings on ADZBE have been checked for authenticity.

3. Compare Multiple Options
Don't settle for the first option. Compare prices, services, and customer feedback across multiple providers.

4. Consider Location
Choose a service provider near you to save time and money on travel. Use ADZBE to find businesses in your area.

5. Ask for Recommendations
Word of mouth is still valuable. Ask friends and family for recommendations, then verify on ADZBE.`,
  },
  'benefits-local-businesses': {
    title: 'Benefits of Supporting Local Businesses',
    content: `Supporting local businesses strengthens your community and economy. Here's why it matters.

Economic Impact
Local businesses create jobs and keep money circulating within the community. When you shop local, more of your money stays in your city.

Personalized Service
Local business owners often provide more personalized attention and care about their reputation in the community.

Environmental Benefits
Shopping locally reduces transportation emissions and packaging waste, making it a more sustainable choice.

Unique Offerings
Local businesses offer unique products and services that you won't find at large chains, adding character to your community.

Community Building
Local businesses sponsor local teams, donate to local causes, and contribute to the overall well-being of the community.`,
  },
  'digital-marketing-small-business': {
    title: 'Digital Marketing Tips for Small Businesses',
    content: `Digital marketing can help small businesses reach more customers. Here are practical tips.

Claim Your Online Listings
Make sure your business is listed on ADZBE and other directories. Complete your profile with accurate information, photos, and services offered.

Optimize for Local Search
Use location-specific keywords in your business description. For example, "best salon in Andheri, Mumbai" instead of just "best salon."

Encourage Reviews
Ask satisfied customers to leave reviews. Positive reviews build trust and improve your visibility on ADZBE.

Use WhatsApp for Communication
WhatsApp is widely used in India. Add your WhatsApp number to your ADZBE listing so customers can reach you instantly.

Keep Information Updated
Regularly update your business hours, services, and contact information. Outdated information frustrates potential customers.`,
  },
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const post = blogTopics[topic]
  if (!post) return { title: 'Blog Post Not Found' }
  return {
    title: post.title,
    description: `Read about ${post.title.toLowerCase()} on ADZBE blog. Tips and insights for local businesses in India.`,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const post = blogTopics[topic]

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-surface-900 mb-4">Post Not Found</h1>
        <Link href="/blog" className="text-brand-600 hover:underline">Back to Blog</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/blog" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>
      <article className="prose prose-surface max-w-none">
        <h1 className="text-3xl font-bold text-surface-900 mb-8">{post.title}</h1>
        {post.content.split('\n\n').map((paragraph, i) => {
          if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ') ||
              paragraph.startsWith('4. ') || paragraph.startsWith('5. ')) {
            return null
          }
          return <p key={i} className="text-surface-600 leading-relaxed mb-4">{paragraph}</p>
        })}
        {post.content.split('\n\n').filter(p => /^\d+\./.test(p)).length > 0 && (
          <ol className="list-decimal list-inside space-y-4">
            {post.content.split('\n\n').filter(p => /^\d+\./.test(p)).map((item, i) => {
              const [num, ...rest] = item.split('. ')
              return (
                <li key={i} className="text-surface-600">
                  <strong className="text-surface-900">{rest[0]}</strong>
                  {rest.slice(1).join('. ')}
                </li>
              )
            })}
          </ol>
        )}
      </article>
    </div>
  )
}
