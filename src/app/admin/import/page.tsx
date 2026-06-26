'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, AlertCircle, CheckCircle, XCircle, FileText, Table, ArrowRight } from 'lucide-react'

interface ParsedRow {
  [key: string]: unknown
}

interface ParseResult {
  rows: ParsedRow[]
  totalRows: number
  headers: string[]
  columnMapping: Record<string, string>
  fileName: string
}

const FIELD_OPTIONS = [
  { value: '', label: '— Skip —' },
  { value: 'name', label: 'name (business name)' },
  { value: 'category', label: 'category (slug)' },
  { value: 'city', label: 'city' },
  { value: 'area', label: 'area / locality' },
  { value: 'district', label: 'district' },
  { value: 'state', label: 'state' },
  { value: 'phone', label: 'phone' },
  { value: 'whatsapp', label: 'whatsapp' },
  { value: 'email', label: 'email' },
  { value: 'website', label: 'website' },
  { value: 'address', label: 'address' },
  { value: 'rating', label: 'rating (1-5)' },
  { value: 'reviews_count', label: 'reviews_count' },
  { value: 'description', label: 'description' },
  { value: 'services', label: 'services' },
  { value: 'featured', label: 'featured (true/false)' },
  { value: 'verified', label: 'verified (true/false)' },
  { value: 'google_maps_url', label: 'google_maps_url' },
  { value: 'place_id', label: 'place_id' },
  { value: 'latitude', label: 'latitude' },
  { value: 'longitude', label: 'longitude' },
  { value: 'opening_hours', label: 'opening_hours' },
  { value: 'source', label: 'source' },
]

export default function AdminImportPage() {
  const [raw, setRaw] = useState('')
  const [preview, setPreview] = useState<ParsedRow[] | null>(null)
  const [parseError, setParseError] = useState('')
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null)
  const [importing, setImporting] = useState(false)

  // File upload state
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [loadingFile, setLoadingFile] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      if (!res.ok) {
        setResult({ inserted: 0, skipped: 0, errors: [data.error || `Request failed (${res.status})`] })
      } else {
        setResult(data)
      }
    } catch {
      setResult({ inserted: 0, skipped: preview.length, errors: ['Network error'] })
    } finally {
      setImporting(false)
    }
  }

  // ── File upload ──

  const handleFile = useCallback(async (file: File) => {
    setFileError('')
    setParseResult(null)
    setResult(null)

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xls', 'xlsx'].includes(ext || '')) {
      setFileError('Please upload a CSV or Excel (.xlsx/.xls) file')
      return
    }

    setLoadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/import-file', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setFileError(data.error || 'Failed to parse file')
        return
      }
      setParseResult(data)
      setMapping(data.columnMapping || {})
    } catch (e) {
      setFileError(e instanceof Error ? e.message : 'Failed to upload file')
    } finally {
      setLoadingFile(false)
    }
  }, [])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function updateMapping(header: string, field: string) {
    setMapping(prev => ({ ...prev, [header]: field }))
  }

  async function handleImportMapped() {
    if (!parseResult) return
    setImporting(true)
    setResult(null)

    const rows = parseResult.rows.map(row => {
      const mapped: Record<string, unknown> = {}
      for (const [header, field] of Object.entries(mapping)) {
        if (field) {
          const val = row[header]
          if (val !== '' && val !== undefined && val !== null) {
            mapped[field] = val
          }
        }
      }
      return mapped
    })

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult({ inserted: 0, skipped: 0, errors: [data.error || `Request failed (${res.status})`] })
      } else {
        setResult(data)
        setParseResult(null)
      }
    } catch {
      setResult({ inserted: 0, skipped: rows.length, errors: ['Network error'] })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">Bulk Import Businesses</h1>
      <p className="text-surface-500 mb-6">
        Upload a CSV or Excel file, or paste JSON.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* ── File Upload ── */}
        <div className="lg:col-span-2">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-surface-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors"
          >
            <FileText className="w-10 h-10 text-surface-400 mx-auto mb-3" />
            <p className="text-surface-700 font-medium mb-1">
              Drop a CSV or Excel file here, or click to browse
            </p>
            <p className="text-sm text-surface-400">
              Supports .csv, .xlsx, .xls &mdash; any column names work, we auto-detect fields
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {loadingFile && (
            <div className="mt-3 flex items-center gap-2 text-sm text-surface-500">
              <div className="animate-spin w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full" />
              Parsing file...
            </div>
          )}

          {fileError && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <a
              href="/api/admin/import-template"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-700 font-medium rounded-xl hover:bg-surface-50 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              Download Template (.csv)
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 text-sm space-y-4">
          <h3 className="font-semibold text-surface-900">Supported fields</h3>
          <ul className="space-y-1 text-surface-600 text-xs">
            <li><code className="text-brand-600">name</code> — required</li>
            <li><code className="text-brand-600">category</code> — slug or name</li>
            <li><code className="text-brand-600">city</code>, <code className="text-brand-600">area</code></li>
            <li><code className="text-brand-600">phone</code>, <code className="text-brand-600">whatsapp</code></li>
            <li><code className="text-brand-600">email</code>, <code className="text-brand-600">website</code></li>
            <li><code className="text-brand-600">rating</code>, <code className="text-brand-600">reviews_count</code></li>
            <li><code className="text-brand-600">address</code>, <code className="text-brand-600">description</code></li>
            <li><code className="text-brand-600">services</code>, <code className="text-brand-600">opening_hours</code></li>
            <li><code className="text-brand-600">featured</code>, <code className="text-brand-600">verified</code></li>
            <li><code className="text-brand-600">source</code>, <code className="text-brand-600">place_id</code></li>
            <li><code className="text-brand-600">google_maps_url</code></li>
            <li><code className="text-brand-600">latitude</code>, <code className="text-brand-600">longitude</code></li>
          </ul>
        </div>
      </div>

      {/* ── Column Mapping ── */}
      {parseResult && (
        <div className="bg-white rounded-xl border border-surface-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
              <Table className="w-5 h-5 text-brand-500" />
              {parseResult.fileName} &mdash; {parseResult.totalRows} rows
            </h2>
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left px-3 py-2 font-medium text-surface-600">Sheet Column</th>
                  <th className="text-left px-3 py-2 font-medium text-surface-600">Maps To</th>
                  <th className="text-left px-3 py-2 font-medium text-surface-600">Preview (first 3 rows)</th>
                </tr>
              </thead>
              <tbody>
                {parseResult.headers.map((header) => (
                  <tr key={header} className="border-b border-surface-100">
                    <td className="px-3 py-2 font-medium text-surface-800">{header}</td>
                    <td className="px-3 py-2">
                      <select
                        value={mapping[header] || ''}
                        onChange={(e) => updateMapping(header, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {FIELD_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-surface-500 text-xs max-w-xs truncate">
                      {parseResult.rows.slice(0, 3).map((row, i) => (
                        <span key={i} className={i > 0 ? 'block mt-0.5' : ''}>
                          {String(row[header] ?? '') || <span className="italic text-surface-300">(empty)</span>}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImportMapped}
              disabled={importing || !Object.values(mapping).some(Boolean)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : `Import mapped data (${parseResult.totalRows} rows)`}
            </button>
            <button
              onClick={() => setParseResult(null)}
              className="px-5 py-2.5 bg-white border border-surface-200 text-surface-700 font-medium rounded-xl hover:bg-surface-50 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {result && typeof result === 'object' && 'inserted' in result && (
        <div className={`p-4 rounded-xl border text-sm mb-6 ${
          result.inserted > 0
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2 font-medium mb-1">
            {result.inserted > 0 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{result.inserted ?? 0} inserted, {result.skipped ?? 0} skipped</span>
          </div>
          {result.errors?.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs max-h-32 overflow-y-auto">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* ── JSON section (existing) ── */}
      <details className="mt-6">
        <summary className="text-sm text-brand-600 hover:text-brand-700 font-medium cursor-pointer">
          Or paste JSON data
        </summary>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">JSON Data</label>
              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={12}
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
          </div>

          <div className="bg-white rounded-xl border border-surface-200 p-5 text-sm space-y-4">
            <h3 className="font-semibold text-surface-900">JSON Format</h3>
            <p className="text-surface-600">Paste a JSON array. Each object should have a <code className="text-brand-600">name</code> field.</p>
          </div>
        </div>

        {/* ── JSON Preview Table ── */}
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
      </details>
    </div>
  )
}
