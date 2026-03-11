'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Row = { id: number; humor_flavor_id: number; caption_count: number; created_datetime_utc: string }

export default function HumorMixClient({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState(initial)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleUpdate(id: number) {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('humor_flavor_mix').update({ caption_count: editValue }).eq('id', id)
    if (err) { setError(err.message) }
    else { setRows(prev => prev.map(r => r.id === id ? { ...r, caption_count: editValue } : r)) }
    setEditingId(null)
    setLoading(false)
  }

  return (
    <div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-800/50 border-b border-gray-800">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Flavor ID</th>
                <th className="px-4 py-3 font-medium">Caption Count</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rows.map(row => (
                <tr key={row.id} className="text-gray-300 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-2.5">{row.id}</td>
                  <td className="px-4 py-2.5">{row.humor_flavor_id}</td>
                  <td className="px-4 py-2.5">
                    {editingId === row.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(Number(e.target.value))}
                        className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-indigo-400 font-medium">{row.caption_count}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{new Date(row.created_datetime_utc).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">
                    {editingId === row.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(row.id)} disabled={loading} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(row.id); setEditValue(row.caption_count) }} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition-colors">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
