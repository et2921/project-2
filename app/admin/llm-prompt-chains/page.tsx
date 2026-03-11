import { createClient } from '@/lib/supabase/server'
import ReadTable from '../components/ReadTable'

export default async function LlmPromptChainsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('llm_prompt_chains')
    .select('id, caption_request_id, created_datetime_utc')
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">LLM Prompt Chains</h1>
        <p className="text-gray-400 text-sm mt-1">{data?.length ?? 0} chains loaded</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <ReadTable
        rows={data ?? []}
        title="LLM Prompt Chains"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'caption_request_id', label: 'Caption Request ID' },
          { key: 'created_datetime_utc', label: 'Created' },
        ]}
      />
    </div>
  )
}
