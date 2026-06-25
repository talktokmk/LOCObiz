'use client'

import { useState } from 'react'
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function AdminImportPage() {
  const [raw, setRaw] = useState('')
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null)
  const [parseError, setParseError] = useState('')
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null)
  const [importing, setImporting] = useState(false)

  function handlePreview() {
    setParseError('')
    setResult(null)
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        setParseError('Input must be a JSON array')
        setPreview(null)
        return
      }
      if (parsed.length === 0) {
        setParseError('Array is empty')
        setPreview(null)
        return
      }
      setPreview(parsed)
    } catch {
      setParseError('Invalid JSON — check syntax')
      setPreview(null)
    }
  }

  async function handleImport() {
    if (!preview) return
    setImporting(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preview),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ inserted: 0, skipped: preview.length, errors: ['Network error'] })
    } finally {
      setImporting(false)
    }
  }



  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">Bulk Import Businesses</h1>
      <p className="text-surface-500 mb-6">
        Paste scraped business data as JSON.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">JSON Data</label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={16}
              placeholder={`[\n  { "name": "...", "category": "restaurants", "city": "Mumbai", "area": "...", "phone": "...", "rating": 4.5 }\n]`}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              disabled={!raw.trim()}
              className="px-5 py-2.5 bg-white border border-surface-200 text-surface-700 font-medium rounded-xl hover:bg-surface-50 transition-colors disabled:opacity-50 text-sm"
            >
              Preview
            </button>
            <button
              onClick={handleImport}
              disabled={!preview || importing}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : `Import${preview ? ` (${preview.length})` : ''}`}
            </button>
          </div>

          {parseError && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-xl border text-sm ${
              result.inserted > 0
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2 font-medium mb-1">
                {result.inserted > 0 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{result.inserted} inserted, {result.skipped} skipped</span>
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 text-sm space-y-4">
          <div>
            <h3 className="font-semibold text-surface-900 mb-2">Format</h3>
            <p className="text-surface-600">
              Paste a JSON array of business objects. Each object supports these fields:
            </p>
          </div>

          <div>
            <h4 className="font-medium text-surface-800 mb-1">Required</h4>
            <ul className="space-y-1 text-surface-600">
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">name</code> — Business name</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-surface-800 mb-1">Optional</h4>
            <ul className="space-y-1 text-surface-600">
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">category</code> — Slug matching a category in the DB (e.g. <code>restaurants</code>, <code>salons</code>)</li>
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">city</code> — e.g. Mumbai, Delhi</li>
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">area</code> — e.g. Andheri, Koramangala</li>
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">phone</code> — +91 9876543210</li>
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">rating</code> — 1.0 to 5.0</li>
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">website</code> — URL</li>
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">description</code> — Text blurb</li>
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">services</code> — Array or JSON string</li>
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">featured</code> — true/false</li>
              <li><code className="text-brand-600 bg-brand-50 px-1 rounded">verified</code> — true/false</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-surface-800 mb-1">How to scrape</h4>
            <ol className="list-decimal list-inside space-y-1 text-surface-600">
              <li>Search on <span className="font-medium">Google Maps</span> or <span className="font-medium">Justdial</span> in your browser</li>
              <li>Copy business names, phones, addresses you want</li>
              <li>Format as JSON and paste above</li>
              <li>Click Preview &rarr; Import</li>
            </ol>
          </div>
        </div>
      </div>

      {preview && !result && (
        <div className="mt-6 bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-4 py-3 bg-surface-50 border-b border-surface-200">
            <span className="text-sm font-medium text-surface-700">Preview: {preview.length} businesses</span>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-50">
                <tr className="border-b border-surface-200">
                  <th className="text-left px-4 py-2 font-medium text-surface-600">#</th>
                  <th className="text-left px-4 py-2 font-medium text-surface-600">Name</th>
                  <th className="text-left px-4 py-2 font-medium text-surface-600">Category</th>
                  <th className="text-left px-4 py-2 font-medium text-surface-600">City</th>
                  <th className="text-left px-4 py-2 font-medium text-surface-600">Area</th>
                  <th className="text-left px-4 py-2 font-medium text-surface-600">Phone</th>
                  <th className="text-left px-4 py-2 font-medium text-surface-600">Rating</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 100).map((item, i) => (
                  <tr key={i} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="px-4 py-2 text-surface-400">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-surface-900">{String(item.name || '')}</td>
                    <td className="px-4 py-2 text-surface-600">{String(item.category || item.category_slug || '-')}</td>
                    <td className="px-4 py-2 text-surface-600">{String(item.city || '-')}</td>
                    <td className="px-4 py-2 text-surface-600">{String(item.area || '-')}</td>
                    <td className="px-4 py-2 text-surface-600">{String(item.phone || '-')}</td>
                    <td className="px-4 py-2 text-surface-600">{item.rating != null ? String(item.rating) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
