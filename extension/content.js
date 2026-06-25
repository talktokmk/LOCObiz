// ADZBE Scraper - Google Maps Content Script

function extractName(el) {
  const s = ['.fontHeadlineSmall', '.qBF1Pd', 'h3', '[role="heading"]', 'a[href*="/maps/place/"]']
  for (const sel of s) {
    const f = el.querySelector(sel)
    if (f && f.textContent.trim()) return f.textContent.trim()
  }
  return el.tagName === 'A' && el.textContent.trim() ? el.textContent.trim() : null
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
  const s = ['.W4Efsd:not(:has(.YH62se))', '.AeaXuf', '.rBNohc', '[class*="address"]', '[class*="vicinity"]']
  for (const sel of s) {
    const f = el.querySelector(sel)
    if (f && f.textContent.trim()) return f.textContent.trim()
  }
  return null
}

function extractPhone(el) {
  const f = el.querySelector('a[href^="tel:"]')
  if (f) return f.getAttribute('href').replace('tel:', '')
  return null
}

function extractWebsite(el) {
  const links = el.querySelectorAll('a[href^="http"]')
  for (const a of links) {
    if (!a.href.includes('google.com/maps')) return a.href
  }
  return null
}

function extractCategory(el) {
  const f = el.querySelector('.YH62se, [class*="tag"]')
  if (f) return f.textContent.trim()
  return null
}

function extractPlaceId(el) {
  const a = el.querySelector('a[href*="/maps/place/"]')
  if (a) {
    const m = a.href.match(/place\/([^\/?]+)/)
    if (m) return m[1]
  }
  return el.getAttribute('data-place-id') || null
}

function extractBusinesses() {
  const businesses = []
  const seen = new Set()

  const containers = document.querySelectorAll(
    '[role="feed"] > div, [role="article"], .Nv2PK, .hfpxzc, a[href*="/maps/place/"]'
  )

  for (const el of containers) {
    try {
      const name = extractName(el)
      if (!name || name.length < 2 || seen.has(name.toLowerCase())) continue
      seen.add(name.toLowerCase())

      businesses.push({
        name,
        rating: extractRating(el),
        reviews: extractReviews(el),
        address: extractAddress(el),
        phone: extractPhone(el),
        website: extractWebsite(el),
        category: extractCategory(el),
        placeId: extractPlaceId(el),
        scrapedAt: new Date().toISOString(),
      })
    } catch { /* skip */ }
  }
  return businesses
}

async function scrollAllResults() {
  const c = document.querySelector('[role="feed"], .m6QErb, .lXJj5c')
  if (!c) return
  let last = 0, same = 0
  for (let i = 0; i < 50; i++) {
    c.scrollTop = c.scrollHeight
    await new Promise(r => setTimeout(r, 1200))
    if (c.scrollHeight === last) { same++; if (same >= 3) break } else same = 0
    last = c.scrollHeight
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    sendResponse({ success: true, businesses: extractBusinesses() })
    return
  }
  if (request.action === 'scrollAll') {
    scrollAllResults().then(() => {
      sendResponse({ success: true, businesses: extractBusinesses() })
    })
    return true // async
  }
  if (request.action === 'getPageInfo') {
    sendResponse({
      url: location.href,
      title: document.title,
      hasResults: document.querySelectorAll('[role="feed"] > div, .Nv2PK').length > 0,
    })
    return
  }
})
