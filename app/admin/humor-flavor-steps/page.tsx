import { createClient } from '@/lib/supabase/server'
import ReadTable from '../components/ReadTable'

export default async function HumorFlavorStepsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('humor_flavor_steps')
    .select('id, humor_flavor_id, description, order_by, llm_model_id, llm_temperature, llm_system_prompt, llm_user_prompt')
    .order('humor_flavor_id', { ascending: true })
    .limit(300)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Humor Flavor Steps</h1>
        <p className="text-gray-400 text-sm mt-1">{data?.length ?? 0} steps</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <ReadTable
        rows={data ?? []}
        title="Humor Flavor Steps"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'humor_flavor_id', label: 'Flavor ID' },
          { key: 'order_by', label: 'Order' },
          { key: 'description', label: 'Description', truncate: true },
          { key: 'llm_model_id', label: 'Model ID' },
          { key: 'llm_temperature', label: 'Temp' },
          { key: 'llm_system_prompt', label: 'System Prompt', truncate: true },
        ]}
      />
    </div>
  )
}
