import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tursoUrl = process.env.TURSO_DB_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN

const db = tursoUrl
  ? createClient({ url: tursoUrl, authToken: tursoToken })
  : createClient({ url: `file:${path.join(__dirname, '..', 'data', 'ADZBE.db')}` })

async function migrate() {
  console.log('Migrating old services JSON to business_services table...')

  const result = await db.execute("SELECT id, name, slug, services FROM businesses WHERE services IS NOT NULL AND services != '' AND services != '[]'")
  const rows = result.rows

  let total = 0
  let skipped = 0

  for (const row of rows) {
    const bizId = row.id
    const servicesStr = row.services

    let serviceNames = []
    try {
      const parsed = JSON.parse(servicesStr)
      if (Array.isArray(parsed)) {
        serviceNames = parsed.filter(s => typeof s === 'string' && s.trim())
      } else if (typeof parsed === 'string') {
        serviceNames = parsed.split(',').map(s => s.trim()).filter(Boolean)
      }
    } catch {
      serviceNames = String(servicesStr).split(',').map(s => s.trim()).filter(Boolean)
    }

    if (serviceNames.length === 0) { skipped++; continue }

    for (const name of serviceNames) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      try {
        await db.execute({
          sql: "INSERT OR IGNORE INTO business_services (business_id, name, slug) VALUES (?, ?, ?)",
          args: [bizId, name, slug],
        })
        total++
      } catch (e) {
        console.error(`  Failed to insert "${name}" for business #${bizId}:`, e.message)
      }
    }
  }

  console.log(`Done! Migrated ${total} services across ${rows.length - skipped} businesses (${skipped} skipped for empty/none)`)

  // Count results
  const count = await db.execute("SELECT COUNT(*) as c FROM business_services")
  console.log(`Total business_services rows now: ${count.rows[0].c}`)
}

migrate().catch(console.error).finally(() => db.close())
