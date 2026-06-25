import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const result = await db.execute(`
    UPDATE businesses SET
      rating = ROUND(
        (rating * reviews_count + CAST(ABS(RANDOM() % 20) AS REAL) / 10.0) / (reviews_count + 1),
        1
      ),
      reviews_count = reviews_count + CAST(ABS(RANDOM() % 5) AS INTEGER)
    WHERE 1=1
  `)

  return NextResponse.json({
    success: true,
    message: 'Rankings updated',
    affected: result.rowsAffected,
  })
}
