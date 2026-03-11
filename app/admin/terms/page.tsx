import { createClient } from '@/lib/supabase/server'
import CrudTable, { type Field } from '../components/CrudTable'

const fields: Field[] = [
  { key: 'id', label: 'ID', readOnly: true },
  { key: 'term', label: 'Term' },
  { key: 'definition', label: 'Definition', type: 'textarea' },
  { key: 'example', label: 'Example', type: 'textarea' },
  { key: 'priority', label: 'Priority', type: 'number' },
  { key: 'term_type_id', label: 'Term Type ID', type: 'number' },
]

export default async function TermsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('terms')
    .select('id, term, definition, example, priority, term_type_id')
    .order('priority', { ascending: false })
    .limit(300)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Terms</h1>
        <p className="text-gray-400 text-sm mt-1">Slang terms and definitions</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <CrudTable table="terms" rows={data ?? []} fields={fields} title="Terms" orderBy="priority" />
    </div>
  )
}
