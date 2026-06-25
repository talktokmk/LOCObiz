import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const city = searchParams.get('city')
  const category = searchParams.get('category')
  const query = searchParams.get('q')
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

  let sql = "SELECT * FROM businesses WHERE status = 'approved'"
  const args: (string | number)[] = []

  if (query) {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)'
    const like = `%${query.toLowerCase()}%`
    args.push(like, like)
  }
  if (city) {
    sql += ' AND LOWER(city) = LOWER(?)'
    args.push(city)
  }
  if (category) {
    sql += ' AND category_slug = ?'
    args.push(category)
  }

  sql += ' ORDER BY featured DESC, whatsapp_clicks DESC, rating DESC, reviews_count DESC LIMIT ? OFFSET ?'
  args.push(limit, offset)

  const result = await db.execute({ sql, args })
  return NextResponse.json(result.rows)
}
