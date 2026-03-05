'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Image = {
  id: string
  created_datetime_utc: string
  url: string
  is_public: boolean
  is_common_use: boolean
  profile_id: string
  image_description: string | null
  additional_context: string | null
}

type ImageFormData = {
  url: string
  is_public: boolean
  is_common_use: boolean
  additional_context: string
}

const emptyForm: ImageFormData = {
  url: '',
  is_public: true,
  is_common_use: false,
  additional_context: '',
}

export default function ImagesClient({ initialImages }: { initialImages: Image[] }) {
  const [images, setImages] = useState<Image[]>(initialImages)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ImageFormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const supabase = createClient()

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setShowCreate(true)
    setError('')
  }

  function openEdit(img: Image) {
    setForm({
      url: img.url,
      is_public: img.is_public,
      is_common_use: img.is_common_use,
      additional_context: img.additional_context ?? '',
    })
    setEditingId(img.id)
    setShowCreate(true)
    setError('')
  }

  function closeForm() {
    setShowCreate(false)
    setEditingId(null)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (editingId) {
      const { error: err } = await supabase
        .from('images')
        .update({
          url: form.url,
          is_public: form.is_public,
          is_common_use: form.is_common_use,
          additional_context: form.additional_context || null,
        })
        .eq('id', editingId)

      if (err) {
        setError(err.message)
      } else {
        setImages(prev =>
          prev.map(img =>
            img.id === editingId
              ? { ...img, url: form.url, is_public: form.is_public, is_common_use: form.is_common_use, additional_context: form.additional_context || null }
              : img
          )
        )
        closeForm()
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error: err } = await supabase
        .from('images')
        .insert({
          url: form.url,
          is_public: form.is_public,
          is_common_use: form.is_common_use,
          additional_context: form.additional_context || null,
          profile_id: user?.id,
        })
        .select('id, created_datetime_utc, url, is_public, is_common_use, profile_id, image_description, additional_context')
        .single()

      if (err) {
        setError(err.message)
      } else if (data) {
        setImages(prev => [data, ...prev])
        closeForm()
      }
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    setLoading(true)
    const { error: err } = await supabase.from('images').delete().eq('id', id)
    if (err) {
      setError(err.message)
    } else {
      setImages(prev => prev.filter(img => img.id !== id))
      setDeleteConfirm(null)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-400 text-sm">{images.length} images loaded</p>
        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Image
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Create/Edit form */}
      {showCreate && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4">{editingId ? 'Edit Image' : 'New Image'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Image URL</label>
              <input
                type="url"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Additional Context</label>
              <textarea
                value={form.additional_context}
                onChange={e => setForm(f => ({ ...f, additional_context: e.target.value }))}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Optional context..."
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                />
                Public
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_common_use}
                  onChange={e => setForm(f => ({ ...f, is_common_use: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                />
                Common Use
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Images grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map(img => (
          <div key={img.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {img.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.url}
                alt=""
                className="w-full h-40 object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="p-3">
              <div className="flex gap-1 mb-2">
                {img.is_public && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">public</span>
                )}
                {img.is_common_use && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">common use</span>
                )}
              </div>
              <p className="text-gray-400 text-xs line-clamp-2 mb-3">
                {img.image_description?.slice(0, 100) || img.additional_context?.slice(0, 100) || 'No description'}
              </p>
              <p className="text-gray-600 text-xs font-mono mb-3">{img.id.slice(0, 8)}…</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(img)}
                  className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </button>
                {deleteConfirm === img.id ? (
                  <button
                    onClick={() => handleDelete(img.id)}
                    disabled={loading}
                    className="flex-1 text-xs bg-red-600 hover:bg-red-500 text-white py-1.5 rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(img.id)}
                    className="flex-1 text-xs bg-gray-800 hover:bg-red-900/50 text-red-400 py-1.5 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-16 text-gray-500">No images found</div>
      )}
    </div>
  )
}
