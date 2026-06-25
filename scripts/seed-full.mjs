import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tursoUrl = process.env.TURSO_DB_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN
const db = tursoUrl
  ? createClient({ url: tursoUrl, authToken: tursoToken })
  : createClient({ url: `file:${path.join(__dirname, '..', 'data', 'locobiz.db')}` })

const states = JSON.parse(fs.readFileSync(path.join(__dirname, 'states.json'), 'utf8'))

const categories = [
  { slug: 'restaurants', name: 'Restaurants', desc: 'Restaurants, cafes, food joints, bakeries, and catering services' },
  { slug: 'salons', name: 'Salons & Spas', desc: 'Salons, spas, beauty parlours, barbers, nail studios, and makeup artists' },
  { slug: 'gyms', name: 'Gyms & Fitness', desc: 'Gyms, fitness centers, yoga studios, crossfit, and personal trainers' },
  { slug: 'doctors', name: 'Doctors & Clinics', desc: 'Doctors, clinics, hospitals, dentists, physiotherapists, and healthcare' },
  { slug: 'plumbers', name: 'Plumbers', desc: 'Plumbers, plumbing services, pipe repair, water heater installation' },
  { slug: 'electricians', name: 'Electricians', desc: 'Electricians, electrical repair, wiring, inverter installation, AC repair' },
  { slug: 'tutors', name: 'Tutors & Classes', desc: 'Tutors, coaching classes, training institutes, academies, and teachers' },
  { slug: 'grocery', name: 'Grocery Stores', desc: 'Grocery stores, supermarkets, kirana shops, vegetable shops, organic stores' },
  { slug: 'pharmacies', name: 'Pharmacies', desc: 'Pharmacies, medical stores, drugstores, chemists, and health stores' },
  { slug: 'carpenters', name: 'Carpenters', desc: 'Carpenters, furniture makers, modular kitchen, woodwork, joinery' },
  { slug: 'painters', name: 'Painters', desc: 'Painters, home painting, wall decor, interior paint, and waterproofing' },
  { slug: 'packers-and-movers', name: 'Packers & Movers', desc: 'Packers and movers, relocation services, transport, and logistics' },
  { slug: 'event-planners', name: 'Event Planners', desc: 'Event planners, wedding planners, party decorators, DJs, and entertainment' },
  { slug: 'photographers', name: 'Photographers', desc: 'Photographers, videographers, photo studio, wedding photography' },
  { slug: 'travel-agents', name: 'Travel Agents', desc: 'Travel agents, tour operators, cab services, car rental, and holiday packages' },
  { slug: 'real-estate', name: 'Real Estate', desc: 'Real estate agents, property dealers, builders, and construction companies' },
  { slug: 'caterers', name: 'Caterers', desc: 'Caterers, event catering, party food, home food, and meal services' },
  { slug: 'tailors', name: 'Tailors', desc: 'Tailors, stitching, alteration, dressmaking, embroidery, and fabric shops' },
  { slug: 'laundry', name: 'Laundry & Dry Clean', desc: 'Laundry services, dry cleaning, wash and iron, dhobi, and laundromat' },
  { slug: 'printing-services', name: 'Printing Services', desc: 'Printing services, digital print, offset, flex, banners, and visiting cards' },
  { slug: 'lawyers', name: 'Lawyers & Advocates', desc: 'Lawyers, advocates, legal advisors, notary, and solicitors' },
  { slug: 'accountants', name: 'Accountants & CA', desc: 'Accountants, chartered accountants, tax filing, GST, and bookkeeping' },
  { slug: 'mechanics', name: 'Mechanics & Auto Repair', desc: 'Mechanics, car repair, bike repair, garage, service center, and tyre shop' },
  { slug: 'pest-control', name: 'Pest Control', desc: 'Pest control, termite treatment, cockroach, mosquito, and fumigation' },
  { slug: 'security-services', name: 'Security Services', desc: 'Security guards, CCTV installation, surveillance, and alarm systems' },
  { slug: 'interior-designers', name: 'Interior Designers', desc: 'Interior designers, home decor, furnishings, curtains, and modular furniture' },
  { slug: 'dermatologists', name: 'Dermatologists', desc: 'Dermatologists, skin care, hair care, laser treatment, and aesthetic clinics' },
  { slug: 'dentists', name: 'Dentists', desc: 'Dentists, dental clinics, root canal, braces, teeth whitening, and orthodontists' },
  { slug: 'electronics-repair', name: 'Electronics Repair', desc: 'Electronics repair, mobile repair, laptop repair, TV repair, and gadget service' },
  { slug: 'car-wash', name: 'Car Wash & Detailing', desc: 'Car wash, car detailing, polishing, interior cleaning, and bike wash' },
  { slug: 'florists', name: 'Florists', desc: 'Florists, flower shops, bouquet delivery, wedding flowers, and floral decoration' },
  { slug: 'pet-services', name: 'Pet Services', desc: 'Pet groomers, pet boarding, pet clinic, dog trainers, and pet shops' },
  { slug: 'home-cleaning', name: 'Home Cleaning', desc: 'Home cleaning, deep cleaning, sofa cleaning, carpet cleaning, and housekeeping' },
  { slug: 'wellness', name: 'Wellness & Alternative', desc: 'Wellness centers, meditation, acupuncture, naturopathy, and alternative healing' },
  { slug: 'courier', name: 'Courier & Parcel', desc: 'Courier services, parcel delivery, speed post, courier pickup, and logistic services' },
]

async function seed() {
  console.log('Seeding states and districts...')
  for (const st of states) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO states (slug, name, type) VALUES (?, ?, ?)',
      args: [st.slug, st.name, st.type],
    })
    for (const dist of st.districts) {
      const distSlug = dist.toLowerCase().replace(/\s+/g, '-')
      await db.execute({
        sql: 'INSERT OR IGNORE INTO districts (slug, name, state_slug) VALUES (?, ?, ?)',
        args: [distSlug, dist, st.slug],
      })
    }
  }
  console.log(`  ${states.length} states, ${states.reduce((a, s) => a + s.districts.length, 0)} districts seeded`)

  console.log('Seeding categories...')
  for (const cat of categories) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO categories (slug, name, description) VALUES (?, ?, ?)',
      args: [cat.slug, cat.name, cat.desc],
    })
  }
  console.log(`  ${categories.length} categories seeded`)

  console.log('Seeding admin...')
  const hash = bcrypt.hashSync('admin123', 10)
  await db.execute({
    sql: 'INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)',
    args: ['admin', hash],
  })
  console.log('  admin / admin123 seeded')

  console.log('\nDone! All states, districts, categories, and admin seeded.')
  db.close()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
