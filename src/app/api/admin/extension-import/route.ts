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
  bombay: 'Mumbai', 'mumbai': 'Mumbai',
  bangalore: 'Bengaluru', 'bengaluru': 'Bengaluru',
  madras: 'Chennai', chennai: 'Chennai',
  calcutta: 'Kolkata', kolkata: 'Kolkata',
  poona: 'Pune', pune: 'Pune',
  ahmedabad: 'Ahmedabad', jaipur: 'Jaipur',
  lucknow: 'Lucknow', hyderabad: 'Hyderabad', secunderabad: 'Hyderabad',
  coimbatore: 'Coimbatore', indore: 'Indore', bhopal: 'Bhopal',
  surat: 'Surat', nagpur: 'Nagpur',
  visakhapatnam: 'Visakhapatnam', vizag: 'Visakhapatnam',
  thiruvananthapuram: 'Thiruvananthapuram', trivandrum: 'Thiruvananthapuram',
  kochi: 'Kochi', cochin: 'Kochi',
  chandigarh: 'Chandigarh', guwahati: 'Guwahati', patna: 'Patna',
  ranchi: 'Ranchi', bhubaneswar: 'Bhubaneswar', bhubaneshwar: 'Bhubaneswar',
  kanpur: 'Kanpur', agra: 'Agra', varanasi: 'Varanasi',
  meerut: 'Meerut', allahabad: 'Prayagraj', prayagraj: 'Prayagraj',
  gorakhpur: 'Gorakhpur', moradabad: 'Moradabad',
  ludhiana: 'Ludhiana', amritsar: 'Amritsar', jalandhar: 'Jalandhar',
  gurgaon: 'Gurugram', gurugram: 'Gurugram', faridabad: 'Faridabad',
  nashik: 'Nashik', aurangabad: 'Aurangabad', solapur: 'Solapur',
  thane: 'Thane', 'navi mumbai': 'Navi Mumbai',
  vadodara: 'Vadodara', baroda: 'Vadodara', rajkot: 'Rajkot',
  bhavnagar: 'Bhavnagar', jamnagar: 'Jamnagar',
  jodhpur: 'Jodhpur', udaipur: 'Udaipur', kota: 'Kota',
  mysore: 'Mysuru', mysuru: 'Mysuru', hubli: 'Hubli', mangalore: 'Mangaluru', mangaluru: 'Mangaluru',
  vijayawada: 'Vijayawada', guntur: 'Guntur', nellore: 'Nellore',
  kurnool: 'Kurnool', tirupati: 'Tirupati', kakinada: 'Kakinada',
  salem: 'Salem', trichy: 'Tiruchirappalli', tiruchirappalli: 'Tiruchirappalli',
  madurai: 'Madurai', tirunelveli: 'Tirunelveli', erode: 'Erode',
  'vellore': 'Vellore', thoothukudi: 'Thoothukudi',
  warangal: 'Warangal', nizamabad: 'Nizamabad', karimnagar: 'Karimnagar',
  dehrdaun: 'Dehradun', dehradun: 'Dehradun', haridwar: 'Haridwar',
  rudrapur: 'Rudrapur', rishikesh: 'Rishikesh',
  srinagar: 'Srinagar', anantnag: 'Anantnag',
  imphal: 'Imphal', shillong: 'Shillong', aizawl: 'Aizawl',
  kohima: 'Kohima', dimapur: 'Dimapur', itanagar: 'Itanagar',
  gangtok: 'Gangtok', agartala: 'Agartala',
  panaji: 'Panaji', 'panjim': 'Panaji', margao: 'Margao',
  porvorim: 'Porvorim', mapusa: 'Mapusa',
  siliguri: 'Siliguri', asansol: 'Asansol', durgapur: 'Durgapur',
  bardhaman: 'Bardhaman', malda: 'Malda',
  bilaspur: 'Bilaspur', raipur: 'Raipur', bhilai: 'Bhilai',
  gwalior: 'Gwalior', jabalpur: 'Jabalpur', ujjain: 'Ujjain',
  satna: 'Satna', rewa: 'Rewa', sagar: 'Sagar',
  kollam: 'Kollam', kannur: 'Kannur', thrissur: 'Thrissur',
  alappuzha: 'Alappuzha', palakkad: 'Palakkad', kottayam: 'Kottayam',
  pathanamthitta: 'Pathanamthitta', idukki: 'Idukki',
  faridkot: 'Faridkot', bathinda: 'Bathinda', patiala: 'Patiala',
  ropar: 'Rupnagar', mohali: 'Mohali', pathankot: 'Pathankot',
  'new delhi': 'Delhi',
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
    if (apiKey === 'ADZBE-extension') {
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

      const phone = b.phone || ''

      if (phone) {
        const dup = await db.execute({
          sql: 'SELECT id FROM businesses WHERE phone = ? LIMIT 1',
          args: [phone],
        })
        if (dup.rows.length > 0) { skipped++; continue }
      }

      const catRaw = b.category || ''
      let catSlug = mapCategory(catRaw, catNames)
      if (catSlug === 'restaurants' && catRaw && !/restaurant|cafe|food|dining|bakery|bistro|hotel|eatery|mess|tiffin|snacks|fast food|sweets|ice cream/i.test(catRaw)) {
        const newSlug = slugify(catRaw)
        if (newSlug && !catMap.has(newSlug)) {
          const displayName = catRaw.replace(/\b\w/g, (c: string) => c.toUpperCase())
          try {
            await db.execute({
              sql: 'INSERT OR IGNORE INTO categories (slug, name) VALUES (?, ?)',
              args: [newSlug, displayName],
            })
            const newCat = await db.execute({
              sql: 'SELECT id FROM categories WHERE slug = ?',
              args: [newSlug],
            })
            if (newCat.rows.length > 0) {
              const row = newCat.rows[0] as Record<string, unknown>
              catMap.set(newSlug, row.id as number)
              catNames.push({ name: displayName.toLowerCase(), slug: newSlug })
              catSlug = newSlug
            }
          } catch { /* keep restaurants as fallback */ }
        } else if (newSlug && catMap.has(newSlug)) {
          catSlug = newSlug
        }
      }
      if (!catMap.has(catSlug)) catSlug = 'restaurants'
      const catId = catMap.get(catSlug)
      if (!catId) { skipped++; continue }

      const address = b.address || ''
      const parsed = parseIndianAddress(address, normalizedDefault)

      const website = b.website || ''
      const placeId = b.placeId || ''
      const slug = `${slugify(name)}-${Date.now()}-${i}`

      try {
        await db.execute({
          sql: `INSERT OR IGNORE INTO businesses
                (name, slug, category_id, category_slug, city, district, state, area, address, phone, website, place_id, description, services, rating, reviews_count, verified, views, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          args: [
            name, slug, catId, catSlug,
            parsed.city || normalizedDefault,
            parsed.district || null,
            parsed.stateSlug || null,
            parsed.area || null,
            address,
            phone, website, placeId,
            `${name} — ${parsed.city || address || name}`,
            '[]', 0, 0, 0,
            0,
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
    [/dentist|dental|root canal|braces|teeth whitening|orthodontist|clinic dental/i, 'dentists'],
    [/dermatologist|skin care|skin clinic|laser treatment|aesthetic|cosmetic clinic|hair fall|acne|scar/i, 'dermatologists'],
    [/caterer|catering service|party food|event food|catering service|home food|meal service|home chef/i, 'caterers'],
    [/accountant|chartered accountant|ca |audit|tax filing|gst filing|bookkeeping|financial advisor|itr/i, 'accountants'],
    [/lawyer|advocate|legal advisor|attorney|notary|court|solicitor|legal consultant|litigation/i, 'lawyers'],
    [/packers and movers|packers & movers|movers|relocation|shifting|transport service|logistics company|courier service|parcel/i, 'packers-and-movers'],
    [/event planner|event management|wedding planner|party organizer|decorator|celebration|stage setup|sound system|dj |entertainment/i, 'event-planners'],
    [/photographer|photography|videography|photo shoot|wedding photography|album|camera|photo studio/i, 'photographers'],
    [/travel agent|travel agency|tour operator|holiday package|vacation trip|cab service|taxi service|car rental|bus booking|flight booking|travel desk/i, 'travel-agents'],
    [/real estate|property dealer|builder|construction company|developer|broker|flat|apartment|plot|land|realty/i, 'real-estate'],
    [/painter|painting service|wall painter|home painting|interior paint|house painting|paint contractor/i, 'painters'],
    [/interior designer|interior design|home decor|furnishing|curtain|modular kitchen|wardrobe design|home interior/i, 'interior-designers'],
    [/laundry|dry cleaner|dry clean|wash and iron|ironing service|dhobi|laundromat|dry cleaning|laundry service/i, 'laundry'],
    [/tailor|stitching|alteration|dress making|couture|embroidery|fabric|blouse stitching|uniform/i, 'tailors'],
    [/printer|printing service|digital print|offset print|flex printing|banner|business card|visiting card|brochure|flyer|poster/i, 'printing-services'],
    [/mechanic|auto repair|garage|car repair|bike repair|service center|workshop|tyre shop|battery|oil change/i, 'mechanics'],
    [/pest control|termite treatment|cockroach|mosquito|rodent|fumigation|insect control|spray|bed bugs/i, 'pest-control'],
    [/security guard|security service|cctv installation|camera|surveillance|alarm system|security system|watchman|security agency/i, 'security-services'],
    [/doctor|clinic|hospital|physiotherapist|ayurvedic|healthcare|medical center|nursing home|diagnostic|eye hospital|physician|surgeon|pediatric|cardio|orthopedic|general physician/i, 'doctors'],
    [/plumber|plumbing|pipe repair|drain cleaning|water heater|septic tank|tap repair|bathroom fitting/i, 'plumbers'],
    [/electrician|electrical|wiring|switchboard|inverter|ac repair|refrigeration|fan repair|lighting/i, 'electricians'],
    [/carpenter|carpentry|furniture repair|furniture maker|wood work|joinery|modular furniture|kitchen cabinet|wardrobe/i, 'carpenters'],
    [/tutor|tuition|coaching class|training institute|education|learning center|academy|teacher|mentor|preschool|school|computer class|spoken english|exam preparation/i, 'tutors'],
    [/gym|fitness center|yoga studio|workout|crossfit|zumba|pilates|aerobics|personal trainer|cardio/i, 'gyms'],
    [/salon|spa|beauty parlor|hair salon|barber|nail salon|makeup|unisex salon|threading|facial|massage|bridal|mehandi/i, 'salons'],
    [/pharmacy|medical store|drugstore|chemist|medicine|drugs|health store|wellness store|ayurvedic store/i, 'pharmacies'],
    [/grocery|supermarket|general store|provision store|kirana|mart|vegetable shop|fruit shop|daily needs|organic store|provision|ration/i, 'grocery'],
    [/restaurant|cafe|food|dining|bakery|bistro|hotel|eatery|mess|tiffin|snacks|fast food|sweets|ice cream/i, 'restaurants'],
  ]

  for (const [regex, slug] of hardcoded) {
    if (regex.test(t)) return slug
  }

  let bestScore = 0
  let bestSlug = 'restaurants'
  for (const cat of dbCategories) {
    let score = 0
    const catName = cat.name.toLowerCase()
    const catSlug = cat.slug.replace(/-/g, ' ')
    const words = t.split(/\s+/)
    for (const word of words) {
      if (catName.includes(word)) score += 2
      if (catSlug.includes(word)) score += 1
    }
    if (t.includes(catName)) score += 3
    if (t === catSlug) score += 5
    if (score > bestScore) {
      bestScore = score
      bestSlug = cat.slug
    }
  }

  return bestSlug
}
