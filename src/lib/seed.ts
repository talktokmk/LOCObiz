import { db, initDb } from './db'
import { hashPassword } from './auth'

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
]

const categories = [
  { slug: 'restaurants', name: 'Restaurants', description: 'Best restaurants and dining places' },
  { slug: 'salons', name: 'Salons & Spas', description: 'Beauty salons, spas and grooming services' },
  { slug: 'gyms', name: 'Gyms & Fitness', description: 'Gyms, fitness centers and yoga studios' },
  { slug: 'doctors', name: 'Doctors & Clinics', description: 'Doctors, dentists and medical clinics' },
  { slug: 'plumbers', name: 'Plumbers', description: 'Plumbing services and repair' },
  { slug: 'electricians', name: 'Electricians', description: 'Electrical services and repair' },
  { slug: 'tutors', name: 'Tutors & Classes', description: 'Private tutors and coaching classes' },
  { slug: 'grocery', name: 'Grocery Stores', description: 'Local grocery stores and supermarkets' },
  { slug: 'pharmacies', name: 'Pharmacies', description: 'Medical stores and pharmacies' },
  { slug: 'carpenters', name: 'Carpenters', description: 'Carpentry and furniture services' },
]

const businessNames = [
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

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function randomRating(): number {
  return Math.round((3.0 + Math.random() * 2.0) * 10) / 10
}

function randomPhone(): string {
  const prefixes = ['98', '99', '97', '96', '95', '93', '94', '91', '90', '88', '87', '86', '85', '84', '83', '82', '81', '80']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = String(Math.floor(10000000 + Math.random() * 90000000))
  return `+91 ${prefix}${suffix}`
}

function randomService(category: string): string[] {
  const serviceMap: Record<string, string[]> = {
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
  return serviceMap[category] || ['General Service']
}

function randomArea(city: string): string {
  const areas: Record<string, string[]> = {
    Mumbai: ['Andheri', 'Bandra', 'Juhu', 'Malad', 'Powai', 'Worli', 'Colaba', 'Dadar'],
    Delhi: ['Connaught Place', 'Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar', 'Karol Bagh', 'Hauz Khas', 'Pitampura'],
    Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'JP Nagar', 'Jayanagar', 'MG Road', 'Banashankari', 'Marathahalli'],
    Hyderabad: ['Gachibowli', 'Hitech City', 'Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Kukatpally', 'Secunderabad', 'Ameerpet'],
    Chennai: ['T Nagar', 'Velachery', 'Adyar', 'Anna Nagar', 'Mylapore', 'Porur', 'Thoraipakkam', 'Guindy'],
    Kolkata: ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Dum Dum', 'Howrah', 'Behala', 'Barasat'],
    Pune: ['Koregaon Park', 'Kharadi', 'Hinjewadi', 'Wakad', 'Baner', 'Shivajinagar', 'Hadapsar', 'Pimple Saudagar'],
    Ahmedabad: ['Satellite', 'SG Highway', 'Navrangpura', 'Maninagar', 'Bodakdev', 'Gota', 'Vastrapur', 'Chandkheda'],
    Jaipur: ['Vaishali Nagar', 'Mansarovar', 'Malviya Nagar', 'Tonk Road', 'Sodala', 'Bani Park', 'Raja Park', 'C Scheme'],
    Lucknow: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Rajajipuram', 'Mahanagar', 'Jankipuram', 'Aminabad'],
  }
  const cityAreas = areas[city] || ['Main Road', 'Market Area', 'Town Center']
  return cityAreas[Math.floor(Math.random() * cityAreas.length)]
}

export async function seedDatabase() {
  await initDb()

  const existing = await db.execute('SELECT COUNT(*) as count FROM categories')
  if (Number((existing.rows[0] as Record<string, unknown>).count) > 0) {
    return { message: 'Database already seeded' }
  }

  for (const cat of categories) {
    await db.execute({
      sql: 'INSERT INTO categories (slug, name, description) VALUES (?, ?, ?)',
      args: [cat.slug, cat.name, cat.description],
    })
  }

  let totalBusinesses = 0
  for (const city of indianCities) {
    for (const cat of categories) {
      const count = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const biz = businessNames[Math.floor(Math.random() * businessNames.length)]
        const suffix = biz.suffix[Math.floor(Math.random() * biz.suffix.length)]
        const name = `${biz.name} ${suffix}`
        const baseSlug = slugify(`${name} ${city}`)
        const slug = `${baseSlug}-${totalBusinesses}`
        const area = randomArea(city)
        const rating = randomRating()
        const services = randomService(cat.slug)
        const verified = Math.random() > 0.4 ? 1 : 0
        const phone = randomPhone()

        await db.execute({
          sql: `INSERT INTO businesses (name, slug, category_id, category_slug, city, area, address, phone, description, services, rating, reviews_count, verified, views, upvotes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            name,
            slug,
            categories.indexOf(cat) + 1,
            cat.slug,
            city,
            area,
            `${area}, ${city}`,
            phone,
            `Best ${cat.name.toLowerCase()} service provider in ${area}, ${city}. We offer quality services at affordable prices.`,
            JSON.stringify(services),
            rating,
            Math.floor(Math.random() * 200 + 10),
            verified,
            Math.floor(Math.random() * 5000 + 100),
            Math.floor(Math.random() * 100 + 1),
          ],
        })
        totalBusinesses++
      }
    }
  }

  const adminPassword = await hashPassword('admin123')
  await db.execute({
    sql: 'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
    args: ['admin', adminPassword],
  })

  return {
    message: 'Database seeded successfully',
    categories: categories.length,
    businesses: totalBusinesses,
    cities: indianCities.length,
  }
}
