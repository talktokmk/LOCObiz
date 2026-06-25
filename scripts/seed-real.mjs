import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tursoUrl = process.env.TURSO_DB_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN
const db = tursoUrl
  ? createClient({ url: tursoUrl, authToken: tursoToken })
  : createClient({ url: `file:${path.join(__dirname, '..', 'data', 'locobiz.db')}` })
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

const statesData = [
  { slug: 'maharashtra', name: 'Maharashtra', type: 'state', districts: ['Mumbai City', 'Mumbai Suburban', 'Thane', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur'] },
  { slug: 'delhi', name: 'Delhi', type: 'ut', districts: ['Central Delhi', 'New Delhi', 'South Delhi', 'West Delhi', 'East Delhi', 'North Delhi'] },
  { slug: 'karnataka', name: 'Karnataka', type: 'state', districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Belagavi', 'Hubballi'] },
  { slug: 'telangana', name: 'Telangana', type: 'state', districts: ['Hyderabad', 'Ranga Reddy', 'Medchal Malkajgiri', 'Sangareddy'] },
  { slug: 'tamil-nadu', name: 'Tamil Nadu', type: 'state', districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
  { slug: 'west-bengal', name: 'West Bengal', type: 'state', districts: ['Kolkata', 'Howrah', 'North 24 Parganas', 'South 24 Parganas'] },
  { slug: 'gujarat', name: 'Gujarat', type: 'state', districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'] },
  { slug: 'uttar-pradesh', name: 'Uttar Pradesh', type: 'state', districts: ['Lucknow', 'Kanpur Nagar', 'Prayagraj', 'Varanasi', 'Agra', 'Ghaziabad'] },
  { slug: 'rajasthan', name: 'Rajasthan', type: 'state', districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer'] },
  { slug: 'andhra-pradesh', name: 'Andhra Pradesh', type: 'state', districts: ['Visakhapatnam', 'Guntur', 'Krishna', 'East Godavari', 'Chittoor'] },
]

const categories = [
  { slug: 'restaurants', name: 'Restaurants' },
  { slug: 'salons', name: 'Salons & Spas' },
  { slug: 'gyms', name: 'Gyms & Fitness' },
  { slug: 'doctors', name: 'Doctors & Clinics' },
  { slug: 'plumbers', name: 'Plumbers' },
  { slug: 'electricians', name: 'Electricians' },
  { slug: 'tutors', name: 'Tutors & Classes' },
  { slug: 'grocery', name: 'Grocery Stores' },
  { slug: 'pharmacies', name: 'Pharmacies' },
  { slug: 'carpenters', name: 'Carpenters' },
]

const fallbackBiz = [
  { name: 'Sharma', suffix: ['Restaurant', 'Sweet Shop', 'General Store'] },
  { name: 'Patel', suffix: ['Pharmacy', 'Grocery', 'Hardware'] },
  { name: 'Singh', suffix: ['Salon', 'Gym', 'Electronics'] },
  { name: 'Gupta', suffix: ['Clinic', 'Tutoring Center', 'Book Store'] },
  { name: 'Reddy', suffix: ['Restaurant', 'Medical Store', 'Fitness Center'] },
  { name: 'Joshi', suffix: ['Ayurvedic Clinic', 'Yoga Studio', 'Catering'] },
  { name: 'Khan', suffix: ['Salon', 'Bakery', 'Tailoring'] },
  { name: 'Verma', suffix: ['Electricals', 'Plumbing Works', 'Hardware Store'] },
  { name: 'Das', suffix: ['Pharmacy', 'General Store', 'Stationery'] },
  { name: 'Nair', suffix: ['Restaurant', 'Catering Service', 'Health Clinic'] },
]

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function randomPhone() {
  const prefixes = ['98', '99', '97', '96', '95', '93', '94', '91', '90']
  return `+91 ${prefixes[Math.floor(Math.random() * prefixes.length)]}${String(Math.floor(10000000 + Math.random() * 90000000))}`
}

function randomRating() {
  return Math.round((3.0 + Math.random() * 2.0) * 10) / 10
}

function pickServices(slug) {
  const map = {
    restaurants: ['Dine-in', 'Takeaway', 'Home Delivery', 'Catering', 'Party Orders'],
    salons: ['Haircut', 'Facial', 'Manicure', 'Pedicure', 'Shaving'],
    gyms: ['Personal Training', 'Yoga Classes', 'Zumba', 'Cardio', 'Weight Training'],
    doctors: ['OPD', 'Consultation', 'Lab Tests', 'Vaccination', 'Health Checkup'],
    plumbers: ['Pipe Repair', 'Tap Installation', 'Drain Cleaning', 'Water Heater Repair', 'Bathroom Fitting'],
    electricians: ['Wiring', 'Fan Repair', 'AC Installation', 'Switch Board Repair', 'Inverter Setup'],
    tutors: ['Math', 'Science', 'English', 'Hindi', 'Exam Preparation'],
    grocery: ['Daily Needs', 'Fresh Vegetables', 'Packaged Foods', 'Home Delivery', 'Bulk Orders'],
    pharmacies: ['Prescription', 'OTC Medicines', 'Health Supplements', 'Baby Care', 'First Aid'],
    carpenters: ['Furniture Repair', 'Custom Furniture', 'Cabinet Making', 'Door Repair', 'Wood Polish'],
  }
  return map[slug] || ['General Service']
}

function generateDescription(name, categoryName, area, city) {
  return `${name} is a trusted ${categoryName.toLowerCase()} service provider in ${area}, ${city}. We are committed to delivering quality services at affordable prices with customer satisfaction guaranteed. Visit us today or contact us for more information.`
}

// Map OSM tag → our category slugs
const osmTagToCategory = [
  { tags: ['amenity=restaurant', 'amenity=fast_food', 'amenity=cafe'], slug: 'restaurants', key: ['restaurant', 'fast_food', 'cafe'] },
  { tags: ['amenity=beauty_salon', 'shop=hairdresser', 'shop=beauty'], slug: 'salons', key: ['beauty_salon', 'hairdresser', 'beauty'] },
  { tags: ['amenity=gym', 'leisure=fitness_centre'], slug: 'gyms', key: ['gym', 'fitness_centre'] },
  { tags: ['amenity=doctors', 'amenity=clinic', 'amenity=hospital', 'healthcare=*'], slug: 'doctors', key: ['doctors', 'clinic', 'hospital', null] },
  { tags: ['craft=plumber'], slug: 'plumbers', key: ['plumber'] },
  { tags: ['craft=electrician'], slug: 'electricians', key: ['electrician'] },
  { tags: [], slug: 'tutors', key: [] },
  { tags: ['shop=supermarket', 'shop=grocery', 'shop=convenience'], slug: 'grocery', key: ['supermarket', 'grocery', 'convenience'] },
  { tags: ['amenity=pharmacy'], slug: 'pharmacies', key: ['pharmacy'] },
  { tags: ['craft=carpenter'], slug: 'carpenters', key: ['carpenter'] },
]

// Build the full Overpass query for one city
function buildCityQuery(city) {
  const allTagFilters = osmTagToCategory
    .filter(tc => tc.tags.length)
    .flatMap(tc => tc.tags.map(t => {
      const [k, v] = t.split('=')
      if (v === '*') return `(node[${k}](area.a);way[${k}](area.a);)`
      return `(node["${k}"="${v}"](area.a);way["${k}"="${v}"](area.a);)`
    })).join('')

  return `[out:json][timeout:45];area["name"="${city}"][boundary=administrative]->.a;${allTagFilters};out center 100;`
}

function classifyElement(el) {
  const t = el.tags || {}
  const catMap = [
    { keys: ['shop'], vals: ['supermarket', 'grocery', 'convenience'], slug: 'grocery' },
    { keys: ['shop'], vals: ['hairdresser', 'beauty', 'beauty_salon'], slug: 'salons' },
    { keys: ['amenity'], vals: ['restaurant', 'fast_food', 'cafe'], slug: 'restaurants' },
    { keys: ['amenity'], vals: ['gym'], slug: 'gyms' },
    { keys: ['leisure'], vals: ['fitness_centre'], slug: 'gyms' },
    { keys: ['amenity'], vals: ['doctors', 'clinic', 'hospital'], slug: 'doctors' },
    { keys: ['healthcare'], vals: ['*'], slug: 'doctors' },
    { keys: ['craft'], vals: ['plumber'], slug: 'plumbers' },
    { keys: ['craft'], vals: ['electrician'], slug: 'electricians' },
    { keys: ['craft'], vals: ['carpenter'], slug: 'carpenters' },
    { keys: ['amenity'], vals: ['pharmacy'], slug: 'pharmacies' },
  ]
  for (const mapping of catMap) {
    for (const key of mapping.keys) {
      const val = t[key]
      if (!val) continue
      if (mapping.vals.includes('*') || mapping.vals.includes(val)) return mapping.slug
    }
  }
  return null
}

const cityConfig = [
  { city: 'Mumbai', state: 'maharashtra', district: 'Mumbai City', areas: ['Andheri', 'Bandra', 'Juhu', 'Malad', 'Powai', 'Worli', 'Colaba', 'Dadar'] },
  { city: 'Delhi', state: 'delhi', district: 'Central Delhi', areas: ['Connaught Place', 'Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar', 'Karol Bagh', 'Hauz Khas', 'Pitampura'] },
  { city: 'Bangalore', state: 'karnataka', district: 'Bengaluru Urban', areas: ['Koramangala', 'Indiranagar', 'Whitefield', 'JP Nagar', 'Jayanagar', 'MG Road', 'Banashankari', 'Marathahalli'] },
  { city: 'Hyderabad', state: 'telangana', district: 'Hyderabad', areas: ['Gachibowli', 'Hitech City', 'Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Kukatpally', 'Secunderabad', 'Ameerpet'] },
  { city: 'Chennai', state: 'tamil-nadu', district: 'Chennai', areas: ['T Nagar', 'Velachery', 'Adyar', 'Anna Nagar', 'Mylapore', 'Porur', 'Thoraipakkam', 'Guindy'] },
  { city: 'Kolkata', state: 'west-bengal', district: 'Kolkata', areas: ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Dum Dum', 'Howrah', 'Behala', 'Barasat'] },
  { city: 'Pune', state: 'maharashtra', district: 'Pune', areas: ['Koregaon Park', 'Kharadi', 'Hinjewadi', 'Wakad', 'Baner', 'Shivajinagar', 'Hadapsar', 'Pimple Saudagar'] },
  { city: 'Ahmedabad', state: 'gujarat', district: 'Ahmedabad', areas: ['Satellite', 'SG Highway', 'Navrangpura', 'Maninagar', 'Bodakdev', 'Gota', 'Vastrapur', 'Chandkheda'] },
  { city: 'Jaipur', state: 'rajasthan', district: 'Jaipur', areas: ['Vaishali Nagar', 'Mansarovar', 'Malviya Nagar', 'Tonk Road', 'Sodala', 'Bani Park', 'Raja Park', 'C Scheme'] },
  { city: 'Lucknow', state: 'uttar-pradesh', district: 'Lucknow', areas: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Rajajipuram', 'Mahanagar', 'Jankipuram', 'Aminabad'] },
]

async function queryCity(city) {
  const q = buildCityQuery(city)
  try {
    const res = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'LOCObiz/1.0' },
      signal: AbortSignal.timeout(40000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.elements || []).filter(e => e.tags && e.tags.name)
  } catch {
    return []
  }
}

function pickArea(osmTags, cfg) {
  const suburb = osmTags.addr_suburb || osmTags.addr_subdistrict || osmTags.addr_district || ''
  if (suburb && cfg.areas.some(a => suburb.toLowerCase().includes(a.toLowerCase()))) return suburb
  return cfg.areas[Math.floor(Math.random() * cfg.areas.length)]
}

async function main() {
  const existing = await db.execute('SELECT COUNT(*) as c FROM categories')
  if (Number(existing.rows[0].c) > 0) {
    console.log('Already seeded. Delete data/locobiz.db first to re-seed.')
    db.close()
    return
  }

  // 1. States & districts
  for (const st of statesData) {
    await db.execute({ sql: 'INSERT INTO states (slug, name, type) VALUES (?, ?, ?)', args: [st.slug, st.name, st.type] })
    for (const d of st.districts) {
      await db.execute({
        sql: 'INSERT INTO districts (slug, name, state_slug) VALUES (?, ?, ?)',
        args: [`${st.slug}/${slugify(d)}`, d, st.slug],
      })
    }
  }
  console.log(`States: ${statesData.length}`)

  // 2. Categories
  for (let i = 0; i < categories.length; i++) {
    await db.execute({ sql: 'INSERT INTO categories (slug, name) VALUES (?, ?)', args: [categories[i].slug, categories[i].name] })
  }
  console.log(`Categories: ${categories.length}`)

  // 3. Businesses
  let total = 0, real = 0, fallback = 0

  for (const cc of cityConfig) {
    process.stdout.write(`\n${cc.city}: `)
    const elements = await queryCity(cc.city)

    // Group OSM elements by category
    const byCat = {}
    for (const el of elements) {
      const catSlug = classifyElement(el)
      if (!catSlug) continue
      if (!byCat[catSlug]) byCat[catSlug] = []
      if (byCat[catSlug].length < 4) byCat[catSlug].push(el)
    }

    const usedNames = new Set()

    for (let ci = 0; ci < categories.length; ci++) {
      const cat = categories[ci]
      const catIndex = ci + 1

      // Insert real OSM businesses for this category
      const osmItems = byCat[cat.slug] || []
      for (const el of osmItems) {
        const name = (el.tags.name || '').trim()
        if (!name || usedNames.has(name.toLowerCase())) continue
        usedNames.add(name.toLowerCase())

        const area = pickArea(el.tags, cc)
        const slug = `${slugify(name)}-${cc.city.toLowerCase()}-${total}`
        const phone = randomPhone() // OSM rarely has phone for India
        const services = JSON.stringify(pickServices(cat.slug))
        const desc = generateDescription(name, cat.name, area, cc.city)

        await db.execute({
          sql: `INSERT INTO businesses (name, slug, category_id, category_slug, city, district, state, area, address, phone, description, services, rating, reviews_count, verified, views, upvotes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [name, slug, catIndex, cat.slug, cc.city, cc.district, cc.state, area, `${area}, ${cc.city}`,
            phone, desc, services, randomRating(), Math.floor(Math.random() * 200 + 10), 1,
            Math.floor(Math.random() * 3000 + 100), Math.floor(Math.random() * 80 + 1)],
        })
        total++
        real++
        process.stdout.write('R')
      }

      // Fill remaining with realistic fallback
      const need = 3 - osmItems.length
      for (let i = 0; i < need; i++) {
        const biz = fallbackBiz[Math.floor(Math.random() * fallbackBiz.length)]
        const suffix = biz.suffix[Math.floor(Math.random() * biz.suffix.length)]
        const name = `${biz.name} ${suffix}`
        if (usedNames.has(name.toLowerCase())) continue
        usedNames.add(name.toLowerCase())

        const area = cc.areas[Math.floor(Math.random() * cc.areas.length)]
        const slug = `${slugify(name)}-${cc.city.toLowerCase()}-${total}`

        await db.execute({
          sql: `INSERT INTO businesses (name, slug, category_id, category_slug, city, district, state, area, address, phone, description, services, rating, reviews_count, verified, views, upvotes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [name, slug, catIndex, cat.slug, cc.city, cc.district, cc.state, area, `${area}, ${cc.city}`,
            randomPhone(), generateDescription(name, cat.name, area, cc.city), JSON.stringify(pickServices(cat.slug)),
            randomRating(), Math.floor(Math.random() * 200 + 10), Math.random() > 0.4 ? 1 : 0,
            Math.floor(Math.random() * 5000 + 100), Math.floor(Math.random() * 100 + 1)],
        })
        total++
        fallback++
        process.stdout.write('F')
      }
    }
  }

  // 4. Admin
  const hash = await bcrypt.hash('admin123', 10)
  await db.execute({ sql: 'INSERT INTO admins (username, password_hash) VALUES (?, ?)', args: ['admin', hash] })

  console.log(`\n\nDone! ${total} businesses (${real} real, ${fallback} realistic fallback), 1 admin`)
  db.close()
}

main().catch(e => { console.error(e); db.close(); process.exit(1) })
