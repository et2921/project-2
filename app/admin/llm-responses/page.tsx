import { createClient } from '@/lib/supabase/server'
import ReadTable from '../components/ReadTable'

export default async function LlmResponsesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('llm_model_responses')
    .select('id, created_datetime_utc, llm_model_response, processing_time_seconds, llm_model_id, humor_flavor_id, caption_request_id')
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">LLM Responses</h1>
        <p className="text-gray-400 text-sm mt-1">{data?.length ?? 0} responses loaded</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <ReadTable
        rows={data ?? []}
        title="LLM Responses"
        columns={[
          { key: 'id', label: 'ID', truncate: true },
          { key: 'llm_model_id', label: 'Model ID' },
          { key: 'humor_flavor_id', label: 'Flavor ID' },
          { key: 'processing_time_seconds', label: 'Time (s)' },
          { key: 'llm_model_response', label: 'Response', truncate: true },
          { key: 'created_datetime_utc', label: 'Created' },
        ]}
      />
    </div>
  )
}
