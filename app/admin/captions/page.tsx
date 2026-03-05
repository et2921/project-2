import { createClient } from '@/lib/supabase/server'

export default async function CaptionsPage() {
  const supabase = await createClient()

  const { data: captions, error } = await supabase
    .from('captions')
    .select('id, created_datetime_utc, content, is_public, is_featured, like_count, profile_id, image_id')
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Captions</h1>
        <p className="text-gray-400 text-sm mt-1">{captions?.length ?? 0} captions loaded</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          Error: {error.message}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-800/50 border-b border-gray-800">
                <th className="px-4 py-3 font-medium">Caption</th>
                <th className="px-4 py-3 font-medium">Likes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Image ID</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {captions?.map(caption => (
                <tr key={caption.id} className="text-gray-300 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 max-w-sm">
                    <p className="truncate" title={caption.content}>{caption.content}</p>
                  </td>
                  <td className="px-4 py-3 text-pink-400 font-medium">{caption.like_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${caption.is_public ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                        {caption.is_public ? 'public' : 'private'}
                      </span>
                      {caption.is_featured && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {caption.image_id?.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(caption.created_datetime_utc).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!captions || captions.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No captions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
