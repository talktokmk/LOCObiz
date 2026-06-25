'use client'

import { useState, useEffect } from 'react'
import { Globe, ExternalLink, AlertCircle, Info, ChevronDown, ChevronUp, List } from 'lucide-react'
import Link from 'next/link'

interface ImportedBusiness {
  id: number
  name: string
  slug: string
  city: string
  category_slug: string
  phone: string
  created_at: string
}

export default function AdminScraperPage() {
  const [recent, setRecent] = useState<ImportedBusiness[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [showPlaces, setShowPlaces] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('restaurants')
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => { fetchRecent() }, [])

  async function fetchRecent() {
    try {
      const res = await fetch('/api/admin/businesses?limit=20')
      const data = res.ok ? await res.json() : []
      setRecent(data)
    } catch { setRecent([]) }
    finally { setLoadingRecent(false) }
  }

  const categories = ['restaurants', 'salons', 'gyms', 'doctors', 'plumbers', 'electricians', 'tutors', 'grocery', 'pharmacies', 'carpenters']

  async function handleSearch() {
    setError('')
    setImportResult(null)
    if (!apiKey) { setError('Enter your Google API key'); return }
    if (!query && !city) { setError('Enter a search query or city'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', apiKey, query, city, category: query ? '' : category }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Search failed'); setResults([]) }
      else { setResults(data.results || []); setSelected(new Set()) }
    } catch { setError('Network error'); setResults([]) }
    finally { setLoading(false) }
  }

  function toggleSelect(id: string) {
    setSelected(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  async function handleImport() {
    if (selected.size === 0) { setError('Select at least one business'); return }
    setError(''); setImportResult(null); setImporting(true)
    try {
      const items = results.filter(r => selected.has(r.placeId as string)).map(r => ({ placeId: r.placeId as string, category, city }))
      const res = await fetch('/api/admin/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', apiKey, selected: items }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Import failed')
      else { setImportResult(data); if (data.inserted > 0) { setResults([]); setSelected(new Set()); fetchRecent() } }
    } catch { setError('Network error') }
    finally { setImporting(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">Scraper</h1>
      <p className="text-surface-500 mb-6">Import real business data from Google Maps.</p>

      {/* ── Chrome Extension Method ── */}
      <div className="bg-white rounded-xl border border-brand-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 text-brand-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-surface-900 mb-1">ADZBE Scraper Extension</h2>
            <p className="text-sm text-surface-500 mb-4">
              Install the Chrome extension, search on Google Maps, and send data directly to ADZBE.
              <strong className="text-surface-700"> Free — no API key needed.</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <div>
                  <div className="font-medium text-surface-800">Install extension</div>
                  <div className="text-surface-500 text-xs mt-0.5">Load the <code className="text-brand-600 bg-brand-50 px-1 rounded">extension/</code> folder in Chrome</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <div>
                  <div className="font-medium text-surface-800">Search on Google Maps</div>
                  <div className="text-surface-500 text-xs mt-0.5">e.g. "restaurants in Andheri"</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <div>
                  <div className="font-medium text-surface-800">Click & Send</div>
                  <div className="text-surface-500 text-xs mt-0.5">Scrape button → Send to ADZBE</div>
                </div>
              </div>
            </div>

            <details className="mt-4">
              <summary className="text-sm text-brand-600 hover:text-brand-700 font-medium cursor-pointer">Installation instructions</summary>
              <div className="mt-3 text-sm text-surface-600 bg-surface-50 rounded-xl p-4 space-y-2">
                <p>1. Open Chrome and go to <code className="text-brand-600 bg-brand-50 px-1 rounded">chrome://extensions</code></p>
                <p>2. Enable <strong>"Developer mode"</strong> (toggle in top-right)</p>
                <p>3. Click <strong>"Load unpacked"</strong></p>
                <p>4. Select the <code className="text-brand-600 bg-brand-50 px-1 rounded">extension</code> folder inside your ADZBE project</p>
                <p>5. The ADZBE icon appears in your toolbar. Go to Google Maps, search, and click it!</p>
                <p className="text-surface-400 text-xs mt-2">
                  Folder path: <code className="text-surface-500">E:\Antigravity\ADZBE\extension</code>
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* ── Recently Imported ── */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-surface-500" />
            <h2 className="text-lg font-bold text-surface-900">Recently Imported</h2>
          </div>
          <Link href="/admin/businesses" className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium">
            View all <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loadingRecent ? (
          <p className="text-sm text-surface-400">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-surface-500">No businesses imported yet. Use the extension or Google Places API above to import real data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 text-surface-600 text-xs">
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-left pb-2 font-medium">City</th>
                  <th className="text-left pb-2 font-medium">Category</th>
                  <th className="text-left pb-2 font-medium">Phone</th>
                  <th className="text-left pb-2 font-medium">Imported</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b border-surface-100 last:border-b-0">
                    <td className="py-2 pr-4 font-medium text-surface-900">{b.name}</td>
                    <td className="py-2 pr-4 text-surface-600">{b.city || '-'}</td>
                    <td className="py-2 pr-4 text-surface-600 capitalize">{b.category_slug}</td>
                    <td className="py-2 pr-4 text-surface-600">{b.phone || '-'}</td>
                    <td className="py-2 text-surface-400 text-xs whitespace-nowrap">{b.created_at ? new Date(b.created_at + 'Z').toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Google Places API (collapsible backup) ── */}
      <button
        onClick={() => setShowPlaces(!showPlaces)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 mb-4"
      >
        {showPlaces ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showPlaces ? 'Hide Google Places API (backup method)' : 'Show Google Places API (backup method)'}
      </button>

      {showPlaces && (
        <>
          <div className="bg-white rounded-xl border border-surface-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-surface-600">Requires a free Google API key. The Chrome extension above is the recommended method.</span>
            </div>

            <label className="block text-sm font-medium text-surface-700 mb-1">Google API Key</label>
            <div className="flex gap-2 items-start mb-4">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-400 hover:text-surface-600">
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-4 py-2.5 text-sm text-brand-600 hover:text-brand-700 font-medium shrink-0">
                <ExternalLink className="w-3.5 h-3.5" /> Get a key
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Search query</label>
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. restaurants" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSearch} disabled={loading || !apiKey} className="px-5 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm">
                {loading ? 'Searching...' : 'Search'}
              </button>
              {selected.size > 0 && (
                <button onClick={handleImport} disabled={importing} className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 text-sm">
                  {importing ? 'Importing...' : `Import ${selected.size}`}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {importResult && (
            <div className={`p-4 mb-6 rounded-xl border text-sm ${importResult.inserted > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <span className="font-medium">{importResult.inserted} imported, {importResult.skipped} skipped</span>
              {importResult.errors.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs max-h-32 overflow-y-auto">
                  {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}

          {results.length > 0 && (
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
                <span className="text-sm font-medium text-surface-700">{results.length} results</span>
                <button onClick={() => setSelected(selected.size === results.length ? new Set() : new Set(results.map(r => r.placeId as string)))} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  {selected.size === results.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="divide-y divide-surface-100 max-h-[600px] overflow-y-auto">
                {results.map((r) => (
                  <div key={r.placeId as string} className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${selected.has(r.placeId as string) ? 'bg-brand-50' : 'hover:bg-surface-50'}`} onClick={() => toggleSelect(r.placeId as string)}>
                    <input type="checkbox" checked={selected.has(r.placeId as string)} onChange={() => toggleSelect(r.placeId as string)} className="mt-1 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-surface-900 text-sm">{r.name as string}</div>
                      <div className="text-xs text-surface-500 mt-0.5 truncate">{(r.address as string) || (r.vicinity as string) || 'No address'}</div>
                      {r.rating != null && <div className="text-xs text-surface-400 mt-0.5">{'★'.repeat(Math.round(r.rating as number))}{'☆'.repeat(5 - Math.round(r.rating as number))} {String(r.rating)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
