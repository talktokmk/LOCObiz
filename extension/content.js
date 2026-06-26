// ADZBE Scraper - Google Maps Content Script v5
// Extracts business data including phone, address, website, rating, and place ID

function isPhoneValue(str) {
  if (!str || typeof str !== 'string') return false
  const digits = str.replace(/[^0-9]/g, '')
  return digits.length >= 10 && digits.length <= 15
}

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
    if (f) {
      const val = f.textContent.trim()
      // Skip results that look like phone numbers instead of addresses
      if (val && !isPhoneValue(val)) return val
    }
  }
  return null
}

function extractPhone(el) {
  const telLink = el.querySelector('a[href^="tel:"]')
  if (telLink) {
    const val = telLink.getAttribute('href').replace('tel:', '')
    if (isPhoneValue(val)) return val
  }

  const buttons = el.querySelectorAll('button, [role="button"], a')
  for (const btn of buttons) {
    const text = btn.textContent || ''
    const href = btn.getAttribute('href') || ''
    if (href.startsWith('tel:')) {
      const val = href.replace('tel:', '')
      if (isPhoneValue(val)) return val
    }
    const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,6}/)
    if (phoneMatch && isPhoneValue(phoneMatch[0])) return phoneMatch[0].trim()
  }

  const allText = el.innerText || ''
  const phoneMatch = allText.match(/(?:\+?91[\s-]?)?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4,6}/g)
  if (phoneMatch) {
    for (const m of phoneMatch) {
      if (isPhoneValue(m)) return m.trim()
    }
  }

  return null
}

function extractWhatsapp(el) {
  // Look for wa.me links
  const waLinks = el.querySelectorAll('a[href*="wa.me"]')
  for (const a of waLinks) {
    const href = a.getAttribute('href') || ''
    const m = href.match(/wa\.me\/(\d+)/)
    if (m && isPhoneValue(m[1])) return m[1]
  }

  // Look for elements with WhatsApp icon or label
  const all = el.querySelectorAll('button, [role="button"], a, [class*="whatsapp"], [aria-label*="whatsapp"i], [aria-label*="WhatsApp"i]')
  for (const btn of all) {
    const text = btn.textContent || ''
    const href = btn.getAttribute('href') || ''
    if (href.includes('wa.me')) {
      const m = href.match(/wa\.me\/(\d+)/)
      if (m && isPhoneValue(m[1])) return m[1]
    }
    if (/whatsapp/i.test(text)) {
      const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,6}/)
      if (phoneMatch && isPhoneValue(phoneMatch[0])) return phoneMatch[0].trim()
    }
  }

  // Look for visible phone number next to a WhatsApp icon in the page
  const allText = el.innerText || ''
  const lines = allText.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (/whatsapp/i.test(lines[i])) {
      const phoneMatch = (lines[i] + ' ' + (lines[i + 1] || '')).match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,6}/)
      if (phoneMatch && isPhoneValue(phoneMatch[0])) return phoneMatch[0].trim()
    }
  }

  return null
}

function isUrl(str) {
  if (!str || typeof str !== 'string') return false
  return /^https?:\/\//i.test(str) || /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}/i.test(str)
}

function extractWebsite(el) {
  const links = el.querySelectorAll('a[href^="http"]')
  for (const a of links) {
    if (!a.href.includes('google.com/maps') && !a.href.includes('google.co.in/maps') && isUrl(a.href)) return a.href
  }
  const buttons = el.querySelectorAll('button, [role="button"]')
  for (const btn of buttons) {
    const dataUri = btn.getAttribute('data-url') || btn.getAttribute('data-href') || ''
    if (dataUri && !dataUri.includes('google.com') && isUrl(dataUri)) return dataUri
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

function extractBusinesses(rootEl) {
  const businesses = []
  const seen = new Set()

  const scrollContainer = findScrollContainer()
  const root = rootEl || scrollContainer || document.body

  const containers = root.querySelectorAll(
    '[role="feed"] > div, [role="article"], .Nv2PK, .hfpxzc, ' +
    'a[href*="/maps/place/"], .section-result, [data-result-index], ' +
    'div[data-place-id], [class*="place-card"], [class*="result"], ' +
    'div[jscontroller][jsaction*="pane"], [class*="listing"]'
  )

  for (const el of containers) {
    try {
      const name = extractName(el)
      if (!name || name.length < 2 || seen.has(name.toLowerCase())) continue
      seen.add(name.toLowerCase())

      const phone = extractPhone(el)
      const whatsapp = extractWhatsapp(el)
      const address = extractAddress(el)
      const website = extractWebsite(el)
      const placeId = extractPlaceId(el)

      businesses.push({
        name,
        rating: extractRating(el),
        reviews: extractReviews(el),
        address,
        phone,
        whatsapp,
        website,
        category: extractCategory(el),
        placeId,
        googleMapsUrl: placeId ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}` : '',
        openingHours: extractOpeningHours(el),
        scrapedAt: new Date().toISOString(),
      })
    } catch { /* skip individual item error */ }
  }
  return businesses
}

// ADZBE Scraper - Google Maps Content Script v3
// Handles lazy-loaded results via MutationObserver + aggressive scrolling

function findScrollContainer() {
  const selectors = [
    '[role="feed"]',
    '.m6QErb',
    '.lXJj5c',
    '.section-scrollbox',
    'div[role="listbox"]',
    '[aria-label*="results"i]',
    '.Nv2PK',
    '.hfpxzc',
  ]
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el) {
      // Walk up to find the scrollable parent
      let parent = el.parentElement
      while (parent) {
        const style = window.getComputedStyle(parent)
        if (style.overflowY === 'scroll' || style.overflowY === 'auto' || parent.scrollHeight > parent.clientHeight) {
          return parent
        }
        parent = parent.parentElement
      }
      return el.closest('[class*="scroll"]') || el
    }
  }
  return null
}

function findResultContainer() {
  const selectors = [
    '[role="feed"]',
    'div[role="listbox"]',
    '.Nv2PK',
  ]
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el) return el.parentElement || el
  }
  return null
}

async function scrollAllResults() {
  const container = findScrollContainer()
  if (!container) { console.warn('ADZBE: no scroll container found'); return }

  const resultContainer = findResultContainer()
  if (!resultContainer) { console.warn('ADZBE: no result container found'); return }

  // Click any "Show more" or "See all" buttons first
  document.querySelectorAll('button, [role="button"]').forEach(btn => {
    const t = (btn.textContent || '').toLowerCase()
    if (t.includes('show more') || t.includes('see all') || t.includes('view all') || t.includes('load more')) {
      try { btn.click() } catch {}
    }
  })

  let lastCount = 0
  let noChangeRounds = 0
  const maxRounds = 40

  for (let round = 0; round < maxRounds; round++) {
    // Scroll the container in stages (smooth vs instant)
    container.scrollTop = container.scrollHeight

    // Also try smoother scroll
    container.scrollTo?.({ top: container.scrollHeight, behavior: 'smooth' })

    await new Promise(r => setTimeout(r, 1200))

    // Try scrolling any inner scrollable divs too
    const innerScrolls = container.querySelectorAll('[style*="overflow"], [class*="scroll"]')
    for (const el of innerScrolls) {
      try { el.scrollTop = el.scrollHeight } catch {}
    }

    // Count current visible business items
    const items = container.querySelectorAll(
      '[role="feed"] > div, [role="article"], .Nv2PK, [data-result-index], ' +
      'a[href*="/maps/place/"], .section-result'
    )
    const currentCount = items.length

    if (currentCount > lastCount) {
      noChangeRounds = 0
      lastCount = currentCount
    } else {
      noChangeRounds++
      if (noChangeRounds >= 4) break
    }
  }
}

function extractAllListingData() {
  const container = findScrollContainer()
  const businesses = extractBusinesses(container)

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

// Timeout helper to prevent hanging
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ])
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'ping') {
      sendResponse({ success: true, ready: true })
      return
    }
    if (request.action === 'scrape') {
      const result = extractBusinesses()
      sendResponse({ success: true, businesses: result })
      return
    }
    if (request.action === 'scrollAll') {
      withTimeout(scrollAllResults(), 30000).then(() => {
        const result = extractBusinesses()
        sendResponse({ success: true, businesses: result })
      }).catch(() => {
        sendResponse({ success: true, businesses: extractBusinesses(), note: 'scroll timed out' })
      })
      return true
    }
    if (request.action === 'scrapeFull') {
      withTimeout(scrollAllResults(), 30000).then(() => {
        const result = extractAllListingData()
        sendResponse({ success: true, ...result })
      }).catch(() => {
        const result = extractAllListingData()
        sendResponse({ success: true, ...result, note: 'scroll timed out' })
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
  } catch (e) {
    sendResponse({ success: false, error: e.message })
  }
})

// Signal content script is ready
chrome.runtime.sendMessage({ action: 'contentScriptReady' }).catch(() => {})
