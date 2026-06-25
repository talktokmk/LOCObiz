'use client'

import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, X } from 'lucide-react'

interface Category {
  id: number
  slug: string
  name: string
  description: string | null
  created_at: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | null>(null)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !newSlug) return
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, slug: newSlug, description: newDesc || null }),
      })
      if (res.ok) {
        setNewName(''); setNewSlug(''); setNewDesc(''); setShowAdd(false)
        await load()
      }
    } catch {}
  }

  async function handleUpdate() {
    if (!editing) return
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (res.ok) { setEditing(null); await load() }
    } catch {}
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this category? Businesses using it will lose their category.')) return
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) await load()
    } catch {}
  }

  if (loading) return <p className="text-surface-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Categories</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-whatsapp text-white font-medium rounded-xl hover:bg-whatsapp-dark transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> {showAdd ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-surface-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Name</label>
              <input
                type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
                placeholder="Plumbers" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Slug</label>
              <input
                type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
                placeholder="plumbers" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
              <input
                type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/40"
                placeholder="Optional"
              />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-whatsapp text-white font-medium rounded-lg hover:bg-whatsapp-dark transition-colors text-sm">
            Create Category
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              <th className="text-left px-4 py-3 font-medium text-surface-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Description</th>
              <th className="text-right px-4 py-3 font-medium text-surface-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-surface-100 hover:bg-surface-50">
                <td className="px-4 py-3 text-surface-400">{cat.id}</td>
                <td className="px-4 py-3">
                  {editing?.id === cat.id ? (
                    <input
                      type="text" value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="w-full px-2 py-1 rounded border border-surface-200 text-sm"
                    />
                  ) : cat.name}
                </td>
                <td className="px-4 py-3">
                  {editing?.id === cat.id ? (
                    <input
                      type="text" value={editing.slug}
                      onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                      className="w-full px-2 py-1 rounded border border-surface-200 text-sm"
                    />
                  ) : cat.slug}
                </td>
                <td className="px-4 py-3 text-surface-500">
                  {editing?.id === cat.id ? (
                    <input
                      type="text" value={editing.description || ''}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value || null })}
                      className="w-full px-2 py-1 rounded border border-surface-200 text-sm"
                    />
                  ) : cat.description || '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  {editing?.id === cat.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={handleUpdate} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1.5 text-surface-400 hover:bg-surface-100 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditing(cat)} className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-surface-400 mt-4">
        Tip: When you add a category here, it becomes available in the scraper and import tools. Make sure the slug matches what Google Maps uses for that business type.
      </p>
    </div>
  )
}
