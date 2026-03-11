import { createClient } from '@/lib/supabase/server'
import ReadTable from '../components/ReadTable'

export default async function CaptionRequestsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('caption_requests')
    .select('id, created_datetime_utc, profile_id, image_id')
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Caption Requests</h1>
        <p className="text-gray-400 text-sm mt-1">{data?.length ?? 0} requests loaded</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <ReadTable
        rows={data ?? []}
        title="Caption Requests"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'profile_id', label: 'Profile ID', truncate: true },
          { key: 'image_id', label: 'Image ID', truncate: true },
          { key: 'created_datetime_utc', label: 'Created' },
        ]}
      />
    </div>
  )
}
