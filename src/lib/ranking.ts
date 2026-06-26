export const RANKING_SQL = `
  (featured * 50) +
  COALESCE(rating, 0) * 8 +
  MIN(COALESCE(reviews_count, 0) / 10.0, 10) +
  MIN(COALESCE(whatsapp_clicks, 0) / 5.0, 10) +
  (verified * 15) +
  (claimed * 10) +
  MIN(COALESCE(upvotes, 0), 10) +
  MIN(COALESCE(views, 0) / 50.0, 10)
`.trim()

export function computeRankingScore(biz: {
  featured?: number | boolean
  rating?: number
  reviews_count?: number
  whatsapp_clicks?: number
  verified?: number | boolean
  claimed?: number | boolean
  upvotes?: number
  views?: number
}): number {
  let score = 0
  if (biz.featured) score += 50
  score += (biz.rating ?? 0) * 8
  score += Math.min((biz.reviews_count ?? 0) / 10, 10)
  score += Math.min((biz.whatsapp_clicks ?? 0) / 5, 10)
  if (biz.verified) score += 15
  if (biz.claimed) score += 10
  score += Math.min(biz.upvotes ?? 0, 10)
  score += Math.min((biz.views ?? 0) / 50, 10)
  return Math.round(score * 10) / 10
}

export function getRankLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Top Rated', color: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' }
  if (score >= 50) return { label: 'Highly Rated', color: 'bg-green-100 text-green-700 ring-1 ring-green-300' }
  if (score >= 25) return { label: 'Popular', color: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' }
  return { label: 'Listed', color: 'bg-surface-100 text-surface-600 ring-1 ring-surface-200' }
}
