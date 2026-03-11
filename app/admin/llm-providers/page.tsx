import { createClient } from '@/lib/supabase/server'
import CrudTable, { type Field } from '../components/CrudTable'

const fields: Field[] = [
  { key: 'id', label: 'ID', readOnly: true },
  { key: 'name', label: 'Name' },
]

export default async function LlmProvidersPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('llm_providers')
    .select('id, name, created_datetime_utc')
    .order('id', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">LLM Providers</h1>
        <p className="text-gray-400 text-sm mt-1">AI model providers</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <CrudTable table="llm_providers" rows={data ?? []} fields={fields} title="LLM Providers" />
    </div>
  )
}
