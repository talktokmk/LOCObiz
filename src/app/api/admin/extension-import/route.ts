import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders })
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

const INDIAN_STATES = [
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa', 'gujarat',
  'haryana', 'himachal pradesh', 'jharkhand', 'karnataka', 'kerala', 'madhya pradesh',
  'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha', 'orissa', 'punjab',
  'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura', 'uttar pradesh', 'uttarakhand',
  'west bengal', 'andaman and nicobar', 'chandigarh', 'dadra and nagar haveli',
  'daman and diu', 'delhi', 'jammu and kashmir', 'ladakh', 'lakshadweep', 'puducherry',
]

const STATE_SLUGS: Record<string, string> = {
  'andhra pradesh': 'andhra-pradesh',
  'arunachal pradesh': 'arunachal-pradesh',
  assam: 'assam', bihar: 'bihar', chhattisgarh: 'chhattisgarh', goa: 'goa',
  gujarat: 'gujarat', haryana: 'haryana', 'himachal pradesh': 'himachal-pradesh',
  jharkhand: 'jharkhand', karnataka: 'karnataka', kerala: 'kerala',
  'madhya pradesh': 'madhya-pradesh', maharashtra: 'maharashtra',
  manipur: 'manipur', meghalaya: 'meghalaya', mizoram: 'mizoram', nagaland: 'nagaland',
  odisha: 'odisha', orissa: 'odisha', punjab: 'punjab', rajasthan: 'rajasthan',
  sikkim: 'sikkim', 'tamil nadu': 'tamil-nadu', telangana: 'telangana',
  tripura: 'tripura', 'uttar pradesh': 'uttar-pradesh', uttarakhand: 'uttarakhand',
  'west bengal': 'west-bengal', delhi: 'delhi',
}

const CITY_NORMALIZE: Record<string, string> = {
  bombay: 'Mumbai', bangalore: 'Bengaluru', 'bengaluru': 'Bengaluru',
  madras: 'Chennai', chennai: 'Chennai', calcutta: 'Kolkata', kolkata: 'Kolkata',
  poona: 'Pune', pune: 'Pune', ahmedabad: 'Ahmedabad', jaipur: 'Jaipur',
  lucknow: 'Lucknow', hyderabad: 'Hyderabad', secunderabad: 'Hyderabad',
  coimbatore: 'Coimbatore', indore: 'Indore', bhopal: 'Bhopal',
  surat: 'Surat', nagpur: 'Nagpur', visakhapatnam: 'Visakhapatnam',
  vizag: 'Visakhapatnam', thiruvananthapuram: 'Thiruvananthapuram',
  trivandrum: 'Thiruvananthapuram', kochi: 'Kochi', cochin: 'Kochi',
  chandigarh: 'Chandigarh', guwahati: 'Guwahati', patna: 'Patna',
  ranchi: 'Ranchi', bhubaneswar: 'Bhubaneswar', bhubaneshwar: 'Bhubaneswar',
}

interface ParsedAddress {
  area: string
  city: string
  district: string
  state: string
  stateSlug: string
  pincode: string
}

function parseIndianAddress(address: string, fallbackCity: string): ParsedAddress {
  const result: ParsedAddress = {
    area: '', city: fallbackCity || '', district: '', state: '',
    stateSlug: '', pincode: '',
  }
  if (!address) return result

  const pincodeMatch = address.match(/\b(\d{6})\b/)
  if (pincodeMatch) result.pincode = pincodeMatch[1]

  const parts = address.split(',').map((p) => p.trim()).filter(Boolean)

  for (const part of parts) {
    const lower = part.toLowerCase()
    const found = INDIAN_STATES.find((s) => lower.includes(s))
    if (found) {
      result.state = found === 'orissa' ? 'Odisha' : found.replace(/\b\w/g, (c) => c.toUpperCase())
      result.stateSlug = STATE_SLUGS[found] || found.toLowerCase().replace(/\s+/g, '-')
      break
    }
  }

  if (!result.stateSlug && result.pincode) {
    if (result.pincode.startsWith('1')) { result.state = 'Delhi'; result.stateSlug = 'delhi' }
    else if (result.pincode.startsWith('2')) { result.state = 'Uttar Pradesh'; result.stateSlug = 'uttar-pradesh' }
    else if (result.pincode.startsWith('3')) { result.state = 'Rajasthan'; result.stateSlug = 'rajasthan' }
    else if (result.pincode.startsWith('4')) { result.state = 'Maharashtra'; result.stateSlug = 'maharashtra' }
    else if (result.pincode.startsWith('5')) { result.state = 'Telangana'; result.stateSlug = 'telangana' }
    else if (result.pincode.startsWith('6')) { result.state = 'Tamil Nadu'; result.stateSlug = 'tamil-nadu' }
    else if (result.pincode.startsWith('7')) { result.state = 'West Bengal'; result.stateSlug = 'west-bengal' }
    else if (result.pincode.startsWith('8')) { result.state = 'Bihar'; result.stateSlug = 'bihar' }
    else if (result.pincode.startsWith('9')) { result.state = 'Gujarat'; result.stateSlug = 'gujarat' }
  }

  const stateIdx = parts.findIndex((p) => {
    const lower = p.toLowerCase()
    return INDIAN_STATES.some((s) => lower.includes(s) || lower.endsWith(s))
  })

  if (stateIdx > 0) {
    const cityCandidate = parts[stateIdx - 1].replace(/\d{6}/g, '').trim()
    const normalized = CITY_NORMALIZE[cityCandidate.toLowerCase()]
    result.city = normalized || cityCandidate

    if (stateIdx > 1) {
      const areaParts = parts.slice(0, stateIdx - 1)
      result.area = areaParts.join(', ')
    } else {
      result.area = parts.slice(0, stateIdx).join(', ')
    }

    if (stateIdx >= 2) {
      result.district = parts[stateIdx - 1].replace(/\d{6}/g, '').trim()
      if (result.district.toLowerCase() === result.city.toLowerCase()) {
        result.district = parts[stateIdx - 2]?.replace(/\d{6}/g, '').trim() || result.district
      }
    }
  }

  if (!result.city && fallbackCity) result.city = fallbackCity

  const areaFromCity = parts.find((p) => {
    const lower = p.toLowerCase()
    return !INDIAN_STATES.some((s) => lower.includes(s))
      && !Object.keys(CITY_NORMALIZE).some((c) => lower.includes(c))
      && !lower.includes(result.city.toLowerCase())
  })
  if (!result.area && areaFromCity) result.area = areaFromCity

  return result
}

export async function POST(request: NextRequest) {
  let session = await getSession()
  if (!session) {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey === 'locobiz-extension') {
      session = { id: 0, username: 'extension' }
    }
  }
  if (!session) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const body = await request.json()
    const businesses = body.businesses
    if (!Array.isArray(businesses) || businesses.length === 0) {
      return json({ error: 'Send { businesses: [...] }' }, 400)
    }

    const catResult = await db.execute('SELECT slug, id, name FROM categories')
    const catMap = new Map<string, number>()
    const catNames: { name: string; slug: string }[] = []
    for (const r of catResult.rows as Record<string, unknown>[]) {
      catMap.set(r.slug as string, r.id as number)
      catNames.push({ name: (r.name as string).toLowerCase(), slug: r.slug as string })
    }

    const defaultCity = (body.city as string) || ''
    const normalizedDefault = CITY_NORMALIZE[defaultCity.toLowerCase()] || defaultCity
    let inserted = 0
    let skipped = 0
    const errors: string[] = []

    for (let i = 0; i < businesses.length; i++) {
      const b = businesses[i]
      if (!b.name || typeof b.name !== 'string') { skipped++; continue }
      const name = b.name.trim()
      if (!name) { skipped++; continue }

      const catRaw = b.category || ''
      let catSlug = mapCategory(catRaw, catNames)
      if (!catMap.has(catSlug)) catSlug = 'restaurants'
      const catId = catMap.get(catSlug)
      if (!catId) { skipped++; continue }

      const address = b.address || ''
      const parsed = parseIndianAddress(address, normalizedDefault)

      const phone = b.phone || ''
      const website = b.website || ''
      const rating = b.rating != null ? Math.min(5, Math.max(0, Number(b.rating))) : 0
      const reviews = b.reviews ? Number(b.reviews) : 0
      const slug = `${slugify(name)}-${Date.now()}-${i}`

      try {
        await db.execute({
          sql: `INSERT OR IGNORE INTO businesses
                (name, slug, category_id, category_slug, city, district, state, area, address, phone, website, description, services, rating, reviews_count, verified, views)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            name, slug, catId, catSlug,
            parsed.city || normalizedDefault,
            parsed.district || null,
            parsed.stateSlug || null,
            parsed.area || null,
            address,
            phone, website,
            `${name} — ${parsed.city || address || name}`,
            '[]', rating, reviews, 1,
            Math.floor(Math.random() * 50 + 1),
          ],
        })
        inserted++
      } catch (err) {
        skipped++
        errors.push(`${name}: insert failed — ${String(err).slice(0, 100)}`)
      }
    }

    return json({ inserted, skipped, errors: errors.slice(0, 20) })
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
}

function mapCategory(text: string, dbCategories: { name: string; slug: string }[]): string {
  const t = text.toLowerCase()

  const hardcoded: [RegExp, string][] = [
    [/restaurant|cafe|food|dining|bakery|cater|bistro|hotel|eatery|mess|tiffin/i, 'restaurants'],
    [/salon|spa|beauty|hair|barber|nail|makeup|parlour|unisex|threading|facial|massage/i, 'salons'],
    [/gym|fitness|yoga|workout|crossfit|zumba|pilates|aerobics|trainer/i, 'gyms'],
    [/doctor|clinic|hospital|dentist|physio|ayurvedic|healthcare|medical|nursing|diagnostic|eye|dental|physician|surgeon|pediatric|cardio|ortho/i, 'doctors'],
    [/plumber|plumbing|pipe|drain|water heater|septic/i, 'plumbers'],
    [/electric|electrical|wiring|switchboard|inverter|ac repair|refrigeration/i, 'electricians'],
    [/tutor|class|coaching|training|education|learning|academy|institute|teacher|mentor|tuition|preschool|school/i, 'tutors'],
    [/grocery|supermarket|general store|provision|kirana|mart|vegetable|fruit shop|daily needs|organic store/i, 'grocery'],
    [/pharmacy|medical store|drugstore|chemist|medicine|drugs|health store|wellness/i, 'pharmacies'],
    [/carpenter|carpentry|furniture|wood|joinery|modular|kitchen cabinet/i, 'carpenters'],
    [/painter|painting|wall|decorator|home painting|interior paint/i, 'painters'],
    [/packers|movers|relocation|shifting|transport|logistics|courier|parcel/i, 'packers-and-movers'],
    [/event|wedding|party|planner|decorator|celebration|stage|sound|dj|entertainment/i, 'event-planners'],
    [/photographer|photography|videography|photo shoot|wedding photo|album/i, 'photographers'],
    [/travel|tour|holiday|vacation|trip|cab|taxi|cab service|car rental|bus booking|flight/i, 'travel-agents'],
    [/real estate|property|builder|construction|developer|broker|agent|flat|apartment|plot|land/i, 'real-estate'],
    [/caterer|catering|party food|event food|catering service|home food|meal service/i, 'caterers'],
    [/tailor|stitching|alteration|dress|couture|embroidery|fabric/i, 'tailors'],
    [/laundry|dry clean|wash|ironing|dhobi|laundromat|dry cleaning/i, 'laundry'],
    [/printer|printing|digital print|offset|flex|banner|business card|visiting card|brochure/i, 'printing-services'],
    [/lawyer|advocate|legal|attorney|notary|legal advisor|court|solicitor/i, 'lawyers'],
    [/accountant|ca|audit|tax|gst|filing|bookkeeping|financial|chartered/i, 'accountants'],
    [/mechanic|auto|garage|car repair|bike repair|service center|workshop|tyre|battery/i, 'mechanics'],
    [/pest|termite|cockroach|mosquito|rodent|fumigation|insect|spray/i, 'pest-control'],
    [/security|guard|cctv|camera|surveillance|alarm|security system|watchman/i, 'security-services'],
    [/interior|designer|interior design|home decor|furnishing|curtain|modular kitchen|wardrobe/i, 'interior-designers'],
    [/dermatologist|skin|hair care|skin care|laser|facial|aesthetic|cosmetic/i, 'dermatologists'],
    [/dentist|dental|root canal|braces|teeth whitening|orthodontist|clinic dental/i, 'dentists'],
  ]

  for (const [regex, slug] of hardcoded) {
    if (regex.test(t)) return slug
  }

  for (const cat of dbCategories) {
    if (t.includes(cat.name) || t.includes(cat.slug.replace(/-/g, ' '))) return cat.slug
  }

  return 'restaurants'
}
