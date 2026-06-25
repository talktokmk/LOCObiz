// ADZBE Scraper - Background Service Worker

const DEFAULT_SERVER = 'https://adzbe.cloud'

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['serverUrl'], (result) => {
    if (!result.serverUrl) {
      chrome.storage.sync.set({ serverUrl: DEFAULT_SERVER })
    }
  })
})

async function sendToADZBE(businesses, serverUrl, city) {
  const res = await fetch(`${serverUrl}/api/admin/extension-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'ADZBE-extension' },
    body: JSON.stringify({ businesses, city }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Server error ${res.status}: ${text}`)
  }
  return res.json()
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendToServer') {
    chrome.storage.sync.get(['serverUrl'], async ({ serverUrl }) => {
      try {
        const result = await sendToADZBE(request.businesses, serverUrl || DEFAULT_SERVER, request.city || '')
        sendResponse({ success: true, result })
      } catch (e) {
        sendResponse({ success: false, error: e.message })
      }
    })
    return true
  }
})
