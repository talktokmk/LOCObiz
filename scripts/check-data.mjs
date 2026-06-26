import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = createClient({ url: `file:${path.join(__dirname, '..', 'data', 'ADZBE.db')}` })

async function check() {
  const cities = await db.execute({ sql: 'SELECT city, COUNT(*) as c FROM businesses WHERE status=? GROUP BY city ORDER BY c DESC', args: ['approved'] })
  console.log('Businesses by city:')
  console.table(cities.rows)
  
  const cats = await db.execute({ sql: 'SELECT category_slug, COUNT(*) as c FROM businesses WHERE status=? GROUP BY category_slug ORDER BY c DESC', args: ['approved'] })
  console.log('\nBy category:')
  console.table(cats.rows)
  
  const sample = await db.execute({ sql: 'SELECT name, city, category_slug, rating, reviews_count, whatsapp_clicks, featured, verified FROM businesses WHERE status=? LIMIT 5', args: ['approved'] })
  console.log('\nSample:')
  console.table(sample.rows)
  
  db.close()
}

check()