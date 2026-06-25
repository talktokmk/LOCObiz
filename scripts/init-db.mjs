import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tursoUrl = process.env.TURSO_DB_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN

const db = tursoUrl
  ? createClient({ url: tursoUrl, authToken: tursoToken })
  : createClient({ url: `file:${path.join(__dirname, '..', 'data', 'ADZBE.db')}` })

await db.execute(`CREATE TABLE IF NOT EXISTS states (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'state'
)`)

await db.execute(`CREATE TABLE IF NOT EXISTS districts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, state_slug TEXT NOT NULL,
  FOREIGN KEY (state_slug) REFERENCES states(slug)
)`)

await db.execute(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, description TEXT, created_at TEXT DEFAULT (datetime('now'))
)`)

await db.execute(`CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, category_id INTEGER NOT NULL,
  category_slug TEXT NOT NULL, city TEXT NOT NULL,
  district TEXT, state TEXT, area TEXT,
    address TEXT, phone TEXT, email TEXT, website TEXT, whatsapp TEXT,
    place_id TEXT, description TEXT, services TEXT, rating REAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0, price_range TEXT, opening_hours TEXT,
  latitude REAL, longitude REAL, image_url TEXT, images TEXT,
    featured INTEGER DEFAULT 0, verified INTEGER DEFAULT 0,
    claimed INTEGER DEFAULT 0, claim_token TEXT, upvotes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'approved',
  views INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
)`)

await db.execute(`CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT, business_id INTEGER NOT NULL,
  name TEXT, phone TEXT NOT NULL, message TEXT, source TEXT DEFAULT 'wa.me',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id)
)`)

await db.execute(`CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
)`)

await db.execute(`CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT, business_id INTEGER,
  page_url TEXT NOT NULL, referrer TEXT, ip_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id)
)`)

await db.execute(`CREATE TABLE IF NOT EXISTS search_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, query TEXT NOT NULL,
  city TEXT, district TEXT, state TEXT, category TEXT,
  results_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
)`)

await db.execute(`CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL,
  city TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
)`)

await db.execute('CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city)')
await db.execute('CREATE INDEX IF NOT EXISTS idx_businesses_district ON businesses(district)')
await db.execute('CREATE INDEX IF NOT EXISTS idx_businesses_state ON businesses(state)')
await db.execute('CREATE INDEX IF NOT EXISTS idx_businesses_category_slug ON businesses(category_slug)')
await db.execute('CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug)')
await db.execute('CREATE INDEX IF NOT EXISTS idx_districts_state_slug ON districts(state_slug)')
await db.execute('CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at)')
try { await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_place_id ON businesses(place_id) WHERE place_id IS NOT NULL AND place_id != \'\'') } catch {}

try { await db.execute("ALTER TABLE businesses ADD COLUMN meta_title TEXT") } catch {}
try { await db.execute("ALTER TABLE businesses ADD COLUMN meta_description TEXT") } catch {}
try { await db.execute("ALTER TABLE businesses ADD COLUMN claimed_by TEXT") } catch {}
try { await db.execute("ALTER TABLE businesses ADD COLUMN whatsapp_clicks INTEGER DEFAULT 0") } catch {}
try { await db.execute("ALTER TABLE businesses ADD COLUMN status TEXT DEFAULT 'approved'") } catch {}
try { await db.execute("ALTER TABLE businesses ADD COLUMN place_id TEXT") } catch {}

console.log('Database initialized successfully')
db.close()
