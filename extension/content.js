// ADZBE Scraper - Google Maps Content Script v2
// Extracts business data including phone, address, website, rating, and place ID

function extractName(el) {
  const selectors = [
    '.fontHeadlineSmall', '.qBF1Pd', 'h3', '[role="heading"]',
    'a[href*="/maps/place/"]', '.headingWithButton h2', '.section-hero-header-title'
  ]
  for (const sel of selectors) {
    const f = el.querySelector(sel)
    if (f && f.textContent.trim()) return f.textContent.trim()
  }
  if (el.tagName === 'A' && el.textContent.trim()) return el.textContent.trim()
  return null
}

function extractRating(el) {
  const t = el.textContent || ''
  const m = t.match(/(\d+(?:\.\d+)?)\s*★/i) || t.match(/★\s*(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

function extractReviews(el) {
  const t = el.textContent || ''
  const m = t.match(/\(([\d,]+)\s*\)/) || t.match(/([\d,]+)\s*(?:review|rating)/i)
  return m ? parseInt(m[1].replace(/,/g, '')) : null
}

function extractAddress(el) {
  const selectors = [
    '.W4Efsd:not(:has(.YH62se))', '.AeaXuf', '.rBNohc',
    '[class*="address"]', '[class*="vicinity"]',
    '.section-info-text', 'button[data-item-id*="address"]',
    '[aria-label*="address"i]', '[aria-label*="Address"i]'
  ]
  for (const sel of selectors) {
    const f = el.querySelector(sel)
    if (f && f.textContent.trim()) return f.textContent.trim()
  }
  return null
}

function extractPhone(el) {
  const telLink = el.querySelector('a[href^="tel:"]')
  if (telLink) return telLink.getAttribute('href').replace('tel:', '')

  const buttons = el.querySelectorAll('button, [role="button"], a')
  for (const btn of buttons) {
    const text = btn.textContent || ''
    const href = btn.getAttribute('href') || ''
    if (href.startsWith('tel:')) return href.replace('tel:', '')
    const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,6}/)
    if (phoneMatch) return phoneMatch[0].trim()
  }

  const allText = el.innerText || ''
  const phoneMatch = allText.match(/(?:\+?91[\s-]?)?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4,6}/g)
  if (phoneMatch) return phoneMatch[0].trim()

  return null
}

function extractWebsite(el) {
  const links = el.querySelectorAll('a[href^="http"]')
  for (const a of links) {
    if (!a.href.includes('google.com/maps') && !a.href.includes('google.co.in/maps')) return a.href
  }
  const buttons = el.querySelectorAll('button, [role="button"]')
  for (const btn of buttons) {
    const dataUri = btn.getAttribute('data-url') || btn.getAttribute('data-href') || ''
    if (dataUri && !dataUri.includes('google.com')) return dataUri
  }
  return null
}

function extractCategory(el) {
  const selectors = [
    '.YH62se', '[class*="tag"]', '.section-industry-star',
    'button[data-item-id*="category"]', '[aria-label*="category"i]'
  ]
  for (const sel of selectors) {
    const f = el.querySelector(sel)
    if (f && f.textContent.trim()) return f.textContent.trim()
  }
  return null
}

function extractPlaceId(el) {
  const a = el.querySelector('a[href*="/maps/place/"]')
  if (a) {
    const m = a.href.match(/place\/([^\/?]+)/)
    if (m) return decodeURIComponent(m[1])
  }
  const dataId = el.getAttribute('data-place-id')
  if (dataId) return dataId

  const allLinks = el.querySelectorAll('[href*="/maps/place/"]')
  for (const link of allLinks) {
    const m = link.getAttribute('href')?.match(/place\/([^\/?]+)/)
    if (m) return decodeURIComponent(m[1])
  }
  return null
}

function extractOpeningHours(el) {
  const hourElements = el.querySelectorAll('[aria-label*="hour"i], [class*="hour"], [class*="open"]')
  const hours = []
  for (const h of hourElements) {
    const text = h.textContent?.trim()
    if (text && text.length > 3 && text.length < 100) hours.push(text)
  }
  const container = el.querySelector('[class*="hours"], .section-hours, .section-open-closed')
  if (container) {
    const lines = container.querySelectorAll('tr, .day, [class*="day"]')
    for (const line of lines) {
      const text = line.textContent?.trim()
      if (text && text.length > 5) hours.push(text)
    }
  }
  return hours.length > 0 ? hours.join('; ').slice(0, 500) : ''
}

function extractBusinesses() {
  const businesses = []
  const seen = new Set()

  const containers = document.querySelectorAll(
    '[role="feed"] > div, [role="article"], .Nv2PK, .hfpxzc, ' +
    'a[href*="/maps/place/"], .section-result, [data-result-index]'
  )

  for (const el of containers) {
    try {
      const name = extractName(el)
      if (!name || name.length < 2 || seen.has(name.toLowerCase())) continue
      seen.add(name.toLowerCase())

      const phone = extractPhone(el)
      const address = extractAddress(el)
      const website = extractWebsite(el)

      businesses.push({
        name,
        rating: extractRating(el),
        reviews: extractReviews(el),
        address,
        phone,
        website,
        category: extractCategory(el),
        placeId: extractPlaceId(el),
        openingHours: extractOpeningHours(el),
        scrapedAt: new Date().toISOString(),
      })
    } catch { /* skip individual item error */ }
  }
  return businesses
}

async function scrollAllResults() {
  const containers = [
    document.querySelector('[role="feed"]'),
    document.querySelector('.m6QErb'),
    document.querySelector('.lXJj5c'),
    document.querySelector('.section-scrollbox'),
  ]
  const c = containers.find(Boolean)
  if (!c) return
  let last = 0
  let same = 0
  for (let i = 0; i < 60; i++) {
    c.scrollTop = c.scrollHeight
    await new Promise(r => setTimeout(r, 1500))
    if (c.scrollHeight === last) { same++; if (same >= 4) break }
    else same = 0
    last = c.scrollHeight
  }
}

function extractAllListingData() {
  const businesses = extractBusinesses()

  const pageCity = document.title.match(/\b(in|near)\s+(\w+(?:\s+\w+)?)/i)

  return {
    businesses,
    pageInfo: {
      url: location.href,
      title: document.title,
      detectedCity: pageCity ? pageCity[2] : '',
      count: businesses.length,
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    const result = extractBusinesses()
    sendResponse({ success: true, businesses: result })
    return
  }
  if (request.action === 'scrollAll') {
    scrollAllResults().then(() => {
      const result = extractBusinesses()
      sendResponse({ success: true, businesses: result })
    })
    return true
  }
  if (request.action === 'scrapeFull') {
    scrollAllResults().then(() => {
      const result = extractAllListingData()
      sendResponse({ success: true, ...result })
    })
    return true
  }
  if (request.action === 'getPageInfo') {
    sendResponse({
      url: location.href,
      title: document.title,
      hasResults: document.querySelectorAll('[role="feed"] > div, .Nv2PK, [data-result-index]').length > 0,
    })
    return
  }
})
