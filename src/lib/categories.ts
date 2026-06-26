export const GOOGLE_TYPE_MAP: Record<string, string> = {
  dentist: 'dentists',
  dental_clinic: 'dentists',
  doctor: 'doctors',
  hospital: 'doctors',
  health: 'doctors',
  physiotherapist: 'doctors',
  pharmacy: 'pharmacies',
  drugstore: 'pharmacies',
  restaurant: 'restaurants',
  cafe: 'restaurants',
  food: 'restaurants',
  bakery: 'restaurants',
  bar: 'restaurants',
  meal_takeaway: 'restaurants',
  meal_delivery: 'restaurants',
  grocery_or_supermarket: 'grocery',
  supermarket: 'grocery',
  convenience_store: 'grocery',
  liquor_store: 'grocery',
  plumber: 'plumbers',
  electrician: 'electricians',
  carpenter: 'carpenters',
  painter: 'painters',
  locksmith: 'electricians',
  roofing_contractor: 'electricians',
  moving_company: 'packers-and-movers',
  storage: 'packers-and-movers',
  travel_agency: 'travel-agents',
  airport: 'travel-agents',
  bus_station: 'travel-agents',
  taxi_stand: 'travel-agents',
  lawyer: 'lawyers',
  accountant: 'accountants',
  finance: 'accountants',
  real_estate_agency: 'real-estate',
  gym: 'gyms',
  fitness_center: 'gyms',
  yoga: 'gyms',
  spa: 'salons',
  beauty_salon: 'salons',
  hair_care: 'salons',
  nail_salon: 'salons',
  barber: 'salons',
  school: 'tutors',
  university: 'tutors',
  secondary_school: 'tutors',
  primary_school: 'tutors',
  preschool: 'tutors',
  tutoring_center: 'tutors',
  training: 'tutors',
  education: 'tutors',
  laundry: 'laundry',
  dry_cleaning: 'laundry',
  photographer: 'photographers',
  tailor: 'tailors',
  printing: 'printing-services',
  painter_t: 'painters',
  interior_design: 'interior-designers',
  interior_decorator: 'interior-designers',
  pest_control: 'pest-control',
  security: 'security-services',
  locksmith2: 'electricians',
  mechanic: 'mechanics',
  car_repair: 'mechanics',
  auto_repair: 'mechanics',
  car_wash: 'mechanics',
  car_dealer: 'mechanics',
  gas_station: 'mechanics',
  event_planning: 'event-planners',
  entertainer: 'event-planners',
  caterer: 'caterers',
  hotel: 'restaurants',
  lodging: 'restaurants',
  church: 'tutors',
  hindu_temple: 'tutors',
  mosque: 'tutors',
  place_of_worship: 'tutors',
  park: 'gyms',
  library: 'tutors',
  museum: 'tutors',
  art_gallery: 'photographers',
  movie_theater: 'event-planners',
  night_club: 'event-planners',
  bowling_alley: 'gyms',
  stadium: 'gyms',
  sports_club: 'gyms',
  veterinary_care: 'doctors',
  animal_shelter: 'doctors',
  pet_store: 'grocery',
  florist: 'grocery',
  home_goods_store: 'interior-designers',
  furniture_store: 'interior-designers',
  hardware_store: 'electricians',
  electronics_store: 'electricians',
  shoe_store: 'tailors',
  clothing_store: 'tailors',
  jewelry_store: 'tailors',
  department_store: 'grocery',
  shopping_mall: 'grocery',
  supermarket2: 'grocery',
  wholesale: 'grocery',
  junior_high_school: 'tutors',
  middle_school: 'tutors',
  preparatory_school: 'tutors',
  trade_school: 'tutors',
  vocational_school: 'tutors',
  language_school: 'tutors',
  driving_school: 'tutors',
  music_school: 'tutors',
  art_school: 'tutors',
  cooking_school: 'tutors',
  dance_school: 'tutors',
  flight_school: 'tutors',
  kindergarten: 'tutors',
  nursery: 'tutors',
  day_care: 'tutors',
  child_care: 'tutors',
  sports_school: 'tutors',
  computer_training: 'tutors',
  educational_institution: 'tutors',
  college: 'tutors',
  local_government_office: 'tutors',
  // New types not previously mapped
  amusement_park: 'event-planners',
  aquarium: 'event-planners',
  atm: 'accountants',
  bank: 'accountants',
  campground: 'travel-agents',
  car_rental: 'travel-agents',
  casino: 'event-planners',
  cemetery: 'tutors',
  city_hall: 'tutors',
  courthouse: 'lawyers',
  embassy: 'tutors',
  fire_station: 'tutors',
  funeral_home: 'tutors',
  insurance_agency: 'accountants',
  light_rail_station: 'travel-agents',
  movie_rental: 'event-planners',
  parking: 'mechanics',
  police: 'tutors',
  post_office: 'tutors',
  store: 'grocery',
  subway_station: 'travel-agents',
  synagogue: 'tutors',
  tourist_attraction: 'travel-agents',
  train_station: 'travel-agents',
  transit_station: 'travel-agents',
  zoo: 'event-planners',
}

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  restaurants: 'Browse top-rated restaurants, cafes, and food joints. Find menus, reviews, and connect instantly on WhatsApp.',
  plumbers: 'Find trusted plumbers for repairs, installation, and emergency plumbing services. Connect on WhatsApp for quick response.',
  electricians: 'Find reliable electricians for wiring, repairs, and electrical installations. Get quotes and connect on WhatsApp.',
  doctors: 'Find qualified doctors, clinics, and hospitals. Book consultations and connect on WhatsApp for quick medical advice.',
  salons: 'Find top-rated salons and beauty parlors for haircuts, facials, makeup, and bridal services. Connect on WhatsApp.',
  tutors: 'Find experienced tutors, coaching centers, and educational institutes. Enroll in classes and connect on WhatsApp.',
  gyms: 'Find fitness centers, gyms, and yoga studios. Compare memberships and connect on WhatsApp.',
  grocers: 'Find grocery stores, supermarkets, and daily-needs shops. Order online and connect on WhatsApp.',
  pharmacies: 'Find pharmacies and medical stores for medicines and health products. Connect on WhatsApp for quick delivery.',
  carpenters: 'Find skilled carpenters for furniture repair, custom woodwork, and home renovations. Connect on WhatsApp.',
  painters: 'Find professional painters for home and office painting. Get free quotes and connect on WhatsApp.',
  'packers-and-movers': 'Find reliable packers and movers for home and office relocation. Get quotes and connect on WhatsApp.',
  'travel-agents': 'Find travel agents for flight booking, holiday packages, and cab services. Connect on WhatsApp.',
  lawyers: 'Find experienced lawyers and legal advisors for consultation and case representation. Connect on WhatsApp.',
  accountants: 'Find chartered accountants for tax filing, GST, audit, and financial planning. Connect on WhatsApp.',
  'real-estate': 'Find property dealers and real estate agents for buying, selling, and renting. Connect on WhatsApp.',
  'interior-designers': 'Find interior designers for home and office decoration. Get free estimates and connect on WhatsApp.',
  photographers: 'Find professional photographers for weddings, events, and portraits. Compare portfolios and connect on WhatsApp.',
  tailors: 'Find skilled tailors for custom stitching, alterations, and dressmaking. Connect on WhatsApp.',
  laundries: 'Find laundry and dry cleaning services for hassle-free clothes care. Connect on WhatsApp.',
  'event-planners': 'Find event planners for weddings, parties, and corporate events. Connect on WhatsApp.',
  caterers: 'Find caterers for weddings, parties, and corporate events. Get menus and connect on WhatsApp.',
  'pest-control': 'Find pest control services for termites, cockroaches, rodents, and mosquitoes. Connect on WhatsApp.',
  'security-services': 'Find security services, CCTV installation, and surveillance systems. Connect on WhatsApp.',
  mechanics: 'Find trusted mechanics and auto repair shops for car and bike servicing. Connect on WhatsApp.',
  'printing-services': 'Find printing services for business cards, banners, brochures, and flyers. Connect on WhatsApp.',
  dermatologists: 'Find dermatologists for skin care, hair treatment, and cosmetic procedures. Connect on WhatsApp.',
  dentists: 'Find dentists for dental checkups, root canals, braces, and teeth whitening. Connect on WhatsApp.',
}

export function detectCategoryFromTypes(types: string[]): string | null {
  for (const type of types) {
    const mapped = GOOGLE_TYPE_MAP[type]
    if (mapped) return mapped
  }
  return null
}

export function detectCategoryFromName(name: string): string | null {
  const t = name.toLowerCase()
  const patterns: [RegExp, string][] = [
    [/plumb|pipe|drain|water heater|septic|tap|bathroom fitting|bathroom repair|plumbing /i, 'plumbers'],
    [/electric|wiring|switchboard|inverter|ac repair|refrigeration|fan|lighting|electrical|circuit|electri/i, 'electricians'],
    [/carpenter|carpentry|furniture repair|furniture maker|wood work|joinery|modular|kitchen cabinet|wardrobe/i, 'carpenters'],
    [/paint|painting|wall paint|home paint|house paint|paint contractor|paint service|color|coating|painter /i, 'painters'],
    [/dentist|dental|root canal|braces|teeth whitening|orthodontist|clinic dental|oral|tooth/i, 'dentists'],
    [/dermatologist|skin care|skin clinic|laser|aesthetic|cosmetic|hair fall|acne|scar laser|laser treatment/i, 'dermatologists'],
    [/doctor|clinic|hospital|physio|ayurvedic|healthcare|medical center|nursing home|diagnostic|eye hospital|physician|surgeon|pediatric|cardio|orthopedic|general physician|medical /i, 'doctors'],
    [/pharmacy|medical store|drugstore|chemist|medicine|drugs|health store|wellness store/i, 'pharmacies'],
    [/grocery|supermarket|general store|provision|kirana|mart|vegetable|fruit|daily needs|organic store|ration/i, 'grocery'],
    [/restaurant|cafe|food|dining|bakery|bistro|hotel|eatery|mess|tiffin|snacks|fast food|sweets|ice cream|pizza|burger|south indian|north indian|chinese|continental|biryani/i, 'restaurants'],
    [/salon|spa|beauty parlor|hair salon|barber|nail|makeup|unisex|threading|facial|massage|bridal|mehandi|beauty /i, 'salons'],
    [/gym|fitness|yoga|workout|crossfit|zumba|pilates|aerobics|personal trainer|cardio|gym /i, 'gyms'],
    [/tutor|tuition|coaching|training|education|learning|academy|teacher|mentor|preschool|school|computer class|spoken english|exam preparation|language class|institute|teaching|study|college|university|campus|kindergarten|nursery|day care|child care|vocational|driving school|music class|dance class|art class/i, 'tutors'],
    [/laundry|dry cleaner|dry clean|wash and iron|ironing|dhobi|laundromat|laundry /i, 'laundry'],
    [/tailor|stitching|alteration|dress making|couture|embroidery|fabric|blouse|uniform/i, 'tailors'],
    [/photographer|photography|videography|photo shoot|wedding photography|album|camera|photo studio|photograph/i, 'photographers'],
    [/printer|printing|digital print|offset print|flex|banner|business card|visiting card|brochure|flyer|poster|print /i, 'printing-services'],
    [/mechanic|auto repair|garage|car repair|bike repair|service center|workshop|tyre|battery|oil change|denting|paint work|car wash|auto /i, 'mechanics'],
    [/pest control|termite|cockroach|mosquito|rodent|fumigation|insect|spray|bed bugs|pest /i, 'pest-control'],
    [/security|cctv|camera|surveillance|alarm|watchman|security /i, 'security-services'],
    [/doctor|clinic|hospital|physio|ayurvedic|healthcare/i, 'doctors'],
    [/cater|catering|party food|event food|home food|meal service|home chef/i, 'caterers'],
    [/accountant|chartered accountant|audit|tax filing|gst|bookkeeping|financial advisor|itr|ca /i, 'accountants'],
    [/lawyer|advocate|legal|attorney|notary|court|solicitor|litigation|advocate /i, 'lawyers'],
    [/packers and movers|packers & movers|movers|relocation|shifting|transport|logistics|courier|parcel|packer/i, 'packers-and-movers'],
    [/event planner|event management|wedding planner|party organizer|decorator|celebration|stage|sound system|dj |entertainment|event /i, 'event-planners'],
    [/travel agent|travel agency|tour operator|holiday|vacation|cab service|taxi service|car rental|bus booking|flight booking|travel /i, 'travel-agents'],
    [/real estate|property dealer|builder|construction|developer|broker|flat|apartment|plot|land|realty|real estate/i, 'real-estate'],
    [/interior designer|interior design|home decor|furnishing|curtain|modular kitchen|wardrobe design|home interior|interior/i, 'interior-designers'],
  ]
  for (const [regex, slug] of patterns) {
    if (regex.test(t)) return slug
  }
  return null
}

export function googleTypeToSlug(type: string): string {
  return type.replace(/_/g, '-').toLowerCase()
}

export function googleTypeToName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function fallbackDescription(catSlug: string): string {
  const catName = catSlug.replace(/-/g, ' ')
  return `Find trusted ${catName} service providers near you. Connect instantly on WhatsApp for quick response and quotes.`
}

export async function ensureCategoryExists(
  db: { execute: (q: { sql: string; args: (string | number)[] }) => Promise<{ rows: Record<string, unknown>[] }> },
  catSlug: string,
  catName?: string,
): Promise<number | null> {
  const displayName = catName || googleTypeToName(catSlug)
  try {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO categories (slug, name, description) VALUES (?, ?, ?)',
      args: [catSlug, displayName, fallbackDescription(catSlug)],
    })
    const res = await db.execute({
      sql: 'SELECT id FROM categories WHERE slug = ?',
      args: [catSlug],
    })
    return (res.rows[0]?.id as number) || null
  } catch {
    return null
  }
}

export function buildSEODescription(name: string, categorySlug: string, city: string, area: string): string {
  const catName = categorySlug.replace(/-/g, ' ')
  const loc = [area, city].filter(Boolean).join(', ')
  return `${name} — trusted ${catName} service${loc ? ` in ${loc}` : ''}. Connect instantly on WhatsApp for quick response and free quotes.`
}

export function buildMetaTitle(name: string, categorySlug: string, city: string): string {
  const catName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return city ? `${name} - ${catName} in ${city}` : `${name} - ${catName}`
}
