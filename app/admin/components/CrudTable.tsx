'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Field = {
  key: string
  label: string
  type?: 'text' | 'number' | 'boolean' | 'textarea' | 'email' | 'url'
  readOnly?: boolean
  hideInForm?: boolean
}

type Row = Record<string, unknown>

export default function CrudTable({
  table,
  rows: initialRows,
  fields,
  title,
  orderBy = 'created_datetime_utc',
}: {
  table: string
  rows: Row[]
  fields: Field[]
  title: string
  orderBy?: string
}) {
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [showForm, setShowForm] = useState(false)
  const [editingRow, setEditingRow] = useState<Row | null>(null)
  const [form, setForm] = useState<Row>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<unknown>(null)
  const supabase = createClient()

  const editableFields = fields.filter(f => !f.readOnly && !f.hideInForm)
  const displayFields = fields.filter(f => !f.hideInForm)

  function openCreate() {
    const empty: Row = {}
    editableFields.forEach(f => {
      empty[f.key] = f.type === 'boolean' ? false : f.type === 'number' ? 0 : ''
    })
    setForm(empty)
    setEditingRow(null)
    setShowForm(true)
    setError('')
  }

  function openEdit(row: Row) {
    const formData: Row = {}
    editableFields.forEach(f => { formData[f.key] = row[f.key] ?? '' })
    setForm(formData)
    setEditingRow(row)
    setShowForm(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload: Row = {}
    editableFields.forEach(f => {
      if (f.type === 'number') payload[f.key] = Number(form[f.key])
      else if (f.type === 'boolean') payload[f.key] = Boolean(form[f.key])
      else payload[f.key] = form[f.key] || null
    })

    if (editingRow) {
      const { error: err } = await supabase.from(table).update(payload).eq('id', editingRow.id)
      if (err) { setError(err.message); setLoading(false); return }
      setRows(prev => prev.map(r => r.id === editingRow.id ? { ...r, ...payload } : r))
    } else {
      const { data, error: err } = await supabase.from(table).insert(payload).select().single()
      if (err) { setError(err.message); setLoading(false); return }
      setRows(prev => [data as Row, ...prev])
    }

    setShowForm(false)
    setEditingRow(null)
    setLoading(false)
  }

  async function handleDelete(id: unknown) {
    setLoading(true)
    const { error: err } = await supabase.from(table).delete().eq('id', id)
    if (err) { setError(err.message) } else { setRows(prev => prev.filter(r => r.id !== id)) }
    setDeleteConfirm(null)
    setLoading(false)
  }

  function formatValue(value: unknown, type?: string): string {
    if (value === null || value === undefined) return '—'
    if (type === 'boolean') return value ? 'Yes' : 'No'
    const str = String(value)
    return str.length > 80 ? str.slice(0, 80) + '…' : str
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-400 text-sm">{rows.length} records</p>
        <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New {title.replace(/s$/, '')}
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}

      {showForm && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4">{editingRow ? `Edit ${title.replace(/s$/, '')}` : `New ${title.replace(/s$/, '')}`}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {editableFields.map(f => (
                <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                  {f.type === 'boolean' ? (
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.key])}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))}
                        className="rounded border-gray-600 bg-gray-800 text-indigo-600"
                      />
                      {f.label}
                    </label>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      value={String(form[f.key] ?? '')}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : 'text'}
                      value={String(form[f.key] ?? '')}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {loading ? 'Saving…' : editingRow ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg border border-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-800/50 border-b border-gray-800">
                {displayFields.map(f => <th key={f.key} className="px-4 py-3 font-medium">{f.label}</th>)}
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rows.map((row, i) => (
                <tr key={String(row.id ?? i)} className="text-gray-300 hover:bg-gray-800/30 transition-colors">
                  {displayFields.map(f => (
                    <td key={f.key} className="px-4 py-2.5 max-w-xs">
                      {f.type === 'boolean' ? (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${row[f.key] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                          {row[f.key] ? 'Yes' : 'No'}
                        </span>
                      ) : (
                        <span className="truncate block" title={String(row[f.key] ?? '')}>{formatValue(row[f.key], f.type)}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(row)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition-colors">Edit</button>
                      {deleteConfirm === row.id ? (
                        <button onClick={() => handleDelete(row.id)} disabled={loading} className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors">Confirm</button>
                      ) : (
                        <button onClick={() => setDeleteConfirm(row.id)} className="text-xs bg-gray-800 hover:bg-red-900/50 text-red-400 px-2 py-1 rounded transition-colors">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={displayFields.length + 1} className="px-4 py-8 text-center text-gray-500">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
