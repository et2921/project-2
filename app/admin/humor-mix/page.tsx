import { createClient } from '@/lib/supabase/server'
import HumorMixClient from './HumorMixClient'

export default async function HumorMixPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('humor_flavor_mix')
    .select('id, humor_flavor_id, caption_count, created_datetime_utc')
    .order('humor_flavor_id', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Humor Mix</h1>
        <p className="text-gray-400 text-sm mt-1">Caption count per humor flavor</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <HumorMixClient rows={data ?? []} />
    </div>
  )
}
