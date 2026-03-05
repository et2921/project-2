import { createClient } from '@/lib/supabase/server'
import ImagesClient from './ImagesClient'

export default async function ImagesPage() {
  const supabase = await createClient()

  const { data: images, error } = await supabase
    .from('images')
    .select('id, created_datetime_utc, url, is_public, is_common_use, profile_id, image_description, additional_context')
    .order('created_datetime_utc', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Images</h1>
        <p className="text-gray-400 text-sm mt-1">Create, read, update and delete images</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          Error: {error.message}
        </div>
      )}

      <ImagesClient initialImages={images ?? []} />
    </div>
  )
}
