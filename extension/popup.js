// ADZBE Scraper - Popup Script

const statusEl = document.getElementById('status')
const scrapeBtn = document.getElementById('scrapeBtn')
const resultsContainer = document.getElementById('resultsContainer')
const countEl = document.getElementById('count')
const actionsEl = document.getElementById('actions')
const sendBtn = document.getElementById('sendBtn')
const resetBtn = document.getElementById('resetBtn')
const messageEl = document.getElementById('message')
const serverUrlInput = document.getElementById('serverUrl')
const cityInput = document.getElementById('cityInput')
const cityRow = document.getElementById('cityRow')

let scrapedBusinesses = []

// Load saved city
chrome.storage.sync.get(['scraperCity'], ({ scraperCity }) => {
  if (scraperCity) cityInput.value = scraperCity
})
cityInput.addEventListener('change', () => {
  chrome.storage.sync.set({ scraperCity: cityInput.value })
})

// Load saved server URL
chrome.storage.sync.get(['serverUrl'], ({ serverUrl }) => {
  serverUrlInput.value = serverUrl || 'https://adzbe.cloud'
})
serverUrlInput.addEventListener('change', () => {
  chrome.storage.sync.set({ serverUrl: serverUrlInput.value })
})

// Extract city from Google Maps URL
function extractCityFromUrl(url) {
  try {
    const u = new URL(url)
    const path = u.pathname + ' ' + u.search
    // Common patterns: /maps/search/restaurants+in+Mumbai/ or /maps/place/...@lat,lng
    const m = path.match(/in\+(\w+(?:\+\w+)*)/i) || path.match(/\/place\/(?:\w+\+)*(\w+)/)
    if (m) return m[1].replace(/\+/g, ' ')
  } catch {}
  return ''
}

// Check current tab
async function checkTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab || !tab.url || !tab.url.includes('google.com/maps')) {
    statusEl.textContent = 'Not on Google Maps. Open maps.google.com and search for businesses.'
    scrapeBtn.disabled = true
    return false
  }
  // Auto-detect city from URL if not set
  if (!cityInput.value) {
    const detected = extractCityFromUrl(tab.url)
    if (detected) cityInput.value = detected
  }
  statusEl.textContent = 'Ready. Click "Scrape this page" to extract businesses.'
  scrapeBtn.disabled = false
  return true
}

checkTab()

// Scrape
scrapeBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab.id) return

  scrapeBtn.disabled = true
  scrapeBtn.innerHTML = '<span class="spinner"></span> Scraping...'
  messageEl.innerHTML = ''
  resultsContainer.style.display = 'none'
  actionsEl.style.display = 'none'

  try {
    // Try to scroll all results first, then scrape
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrollAll' })
    if (response && response.businesses) {
      scrapedBusinesses = response.businesses
      displayResults(scrapedBusinesses)
    } else {
      // Fallback to simple scrape
      const fallback = await chrome.tabs.sendMessage(tab.id, { action: 'scrape' })
      scrapedBusinesses = fallback?.businesses || []
      displayResults(scrapedBusinesses)
    }
  } catch (e) {
    messageEl.innerHTML = `<div class="error">Error: could not access page. Try refreshing Google Maps.</div>`
  }

  scrapeBtn.innerHTML = 'Scrape this page'
  scrapeBtn.disabled = false
})

function displayResults(businesses) {
  resultsContainer.innerHTML = ''
  actionsEl.style.display = 'none'

  if (businesses.length === 0) {
    messageEl.innerHTML = `<div class="error">No businesses found. Make sure you have search results loaded on Google Maps.</div>`
    countEl.style.display = 'none'
    return
  }

  countEl.style.display = 'block'
  countEl.textContent = `Found ${businesses.length} businesses`

  for (const b of businesses.slice(0, 100)) {
    const div = document.createElement('div')
    div.className = 'result'
    div.innerHTML = `
      <div class="result-name">${escapeHtml(b.name)}</div>
      <div class="result-meta">${b.address || ''}${b.category ? ' <span class="badge">' + escapeHtml(b.category) + '</span>' : ''}</div>
      ${b.rating ? `<div class="result-meta">★ ${b.rating}${b.reviews ? ' (' + b.reviews + ' reviews)' : ''}</div>` : ''}
      ${b.phone ? `<div class="result-phone">${escapeHtml(b.phone)}</div>` : ''}
    `
    resultsContainer.appendChild(div)
  }

  resultsContainer.style.display = 'block'
  cityRow.style.display = 'block'
  actionsEl.style.display = 'flex'
}

// Send to ADZBE
sendBtn.addEventListener('click', async () => {
  if (scrapedBusinesses.length === 0) return

  sendBtn.disabled = true
  sendBtn.innerHTML = '<span class="spinner"></span> Sending...'
  messageEl.innerHTML = ''

  chrome.runtime.sendMessage({
    action: 'sendToServer',
    businesses: scrapedBusinesses,
    city: cityInput.value.trim(),
  }, (response) => {
    sendBtn.innerHTML = 'Send to ADZBE'
    sendBtn.disabled = false

    if (response?.success) {
      messageEl.innerHTML = `<div class="success">✓ ${response.result.inserted || scrapedBusinesses.length} businesses imported to ADZBE!</div>`
      scrapedBusinesses = []
      resultsContainer.style.display = 'none'
      countEl.style.display = 'none'
      actionsEl.style.display = 'none'
    } else {
      messageEl.innerHTML = `<div class="error">✗ ${response?.error || 'Failed to send. Check your server URL.'}</div>`
    }
  })
})

resetBtn.addEventListener('click', () => {
  scrapedBusinesses = []
  resultsContainer.style.display = 'none'
  countEl.style.display = 'none'
  actionsEl.style.display = 'none'
  messageEl.innerHTML = ''
})

function escapeHtml(text) {
  if (!text) return ''
  const d = document.createElement('div')
  d.textContent = text
  return d.innerHTML
}
