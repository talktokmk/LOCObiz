import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const headers = [
    'Name', 'Category', 'City', 'Area', 'District', 'State',
    'Phone', 'WhatsApp', 'Email', 'Website', 'Address',
    'Rating', 'Reviews Count', 'Description', 'Services',
    'Opening Hours', 'Google Maps URL', 'Place ID',
    'Latitude', 'Longitude', 'Featured', 'Verified', 'Source',
  ]

  const exampleRow = [
    'Sharma Electronics', 'restaurants', 'Mumbai', 'Andheri West', 'Mumbai', 'maharashtra',
    '+91 98765 43210', '+91 98765 43210', 'info@example.com', 'https://example.com', 'Shop 5, Andheri West, Mumbai 400053',
    '4.5', '128', 'Leading electronics store in Andheri with 10+ years of experience.', '["TV Repair","AC Service"]',
    'Mon-Sat 9:00 AM - 9:00 PM', 'https://www.google.com/maps/place/?q=place_id:ChIJ...', 'ChIJ...',
    '19.1136', '72.8697', 'TRUE', 'TRUE', 'manual',
  ]

  function csvEscape(val: string): string {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

  const csvRows = [
    headers.map(csvEscape).join(','),
    exampleRow.map(csvEscape).join(','),
  ]
  const csv = '\uFEFF' + csvRows.join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="adzbe-import-template.csv"',
    },
  })
}
