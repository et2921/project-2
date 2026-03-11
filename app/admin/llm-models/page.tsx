import { createClient } from '@/lib/supabase/server'
import CrudTable, { type Field } from '../components/CrudTable'

const fields: Field[] = [
  { key: 'id', label: 'ID', readOnly: true },
  { key: 'name', label: 'Name' },
  { key: 'provider_model_id', label: 'Provider Model ID' },
  { key: 'llm_provider_id', label: 'Provider ID', type: 'number' },
  { key: 'is_temperature_supported', label: 'Temp Supported', type: 'boolean' },
]

export default async function LlmModelsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('llm_models')
    .select('id, name, provider_model_id, llm_provider_id, is_temperature_supported')
    .order('id', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">LLM Models</h1>
        <p className="text-gray-400 text-sm mt-1">Available AI models</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <CrudTable table="llm_models" rows={data ?? []} fields={fields} title="LLM Models" />
    </div>
  )
}
