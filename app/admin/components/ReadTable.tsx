type Column = { key: string; label: string; truncate?: boolean }
type Row = Record<string, unknown>

export default function ReadTable({ rows, columns, title }: { rows: Row[]; columns: Column[]; title: string }) {
  function fmt(val: unknown): string {
    if (val === null || val === undefined) return '—'
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    const s = String(val)
    return s.length > 100 ? s.slice(0, 100) + '…' : s
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-800/50 border-b border-gray-800">
              {columns.map(c => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.map((row, i) => (
              <tr key={String(row.id ?? i)} className="text-gray-300 hover:bg-gray-800/30 transition-colors">
                {columns.map(c => (
                  <td key={c.key} className={`px-4 py-2.5 ${c.truncate ? 'max-w-xs' : ''}`}>
                    {typeof row[c.key] === 'boolean' ? (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${row[c.key] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                        {row[c.key] ? 'Yes' : 'No'}
                      </span>
                    ) : (
                      <span className={c.truncate ? 'truncate block' : ''} title={String(row[c.key] ?? '')}>
                        {fmt(row[c.key])}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
