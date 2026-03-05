import { createClient } from '@/lib/supabase/server'

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [
    { count: totalUsers },
    { count: totalImages },
    { count: totalCaptions },
    { count: publicImages },
    { count: publicCaptions },
    { count: featuredCaptions },
    { count: commonUseImages },
    { count: totalVotes },
    { count: totalShares },
    { count: totalLikes },
    { data: topCaptionedImages },
    { data: topLikedCaptions },
    { data: recentCaptions },
    { data: universities },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    supabase.from('images').select('*', { count: 'exact', head: true }).eq('is_common_use', true),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    supabase.from('shares').select('*', { count: 'exact', head: true }),
    supabase.from('caption_likes').select('*', { count: 'exact', head: true }),
    supabase
      .from('captions')
      .select('image_id, images(url, image_description)')
      .limit(1000),
    supabase
      .from('captions')
      .select('content, like_count, image_id')
      .order('like_count', { ascending: false })
      .limit(5),
    supabase
      .from('captions')
      .select('content, created_datetime_utc, is_public, is_featured, like_count')
      .order('created_datetime_utc', { ascending: false })
      .limit(8),
    supabase
      .from('universities')
      .select('id, name'),
  ])

  // Count captions per image to find most captioned
  const imageCaptionCounts: Record<string, number> = {}
  topCaptionedImages?.forEach((c: { image_id: string }) => {
    imageCaptionCounts[c.image_id] = (imageCaptionCounts[c.image_id] || 0) + 1
  })
  const sortedImages = Object.entries(imageCaptionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Get image details for top captioned
  const topImageIds = sortedImages.map(([id]) => id)
  const { data: topImageDetails } = topImageIds.length > 0
    ? await supabase.from('images').select('id, url, image_description').in('id', topImageIds)
    : { data: [] }

  const topCaptionedWithDetails = sortedImages.map(([id, count]) => ({
    id,
    count,
    image: topImageDetails?.find(img => img.id === id),
  }))

  return {
    totalUsers: totalUsers ?? 0,
    totalImages: totalImages ?? 0,
    totalCaptions: totalCaptions ?? 0,
    publicImages: publicImages ?? 0,
    publicCaptions: publicCaptions ?? 0,
    featuredCaptions: featuredCaptions ?? 0,
    commonUseImages: commonUseImages ?? 0,
    totalVotes: totalVotes ?? 0,
    totalShares: totalShares ?? 0,
    totalLikes: totalLikes ?? 0,
    topCaptionedImages: topCaptionedWithDetails,
    topLikedCaptions: topLikedCaptions ?? [],
    recentCaptions: recentCaptions ?? [],
    universityCount: universities?.length ?? 0,
  }
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const stats = await getStats(supabase)

  const imagePublicPct = stats.totalImages > 0
    ? Math.round((stats.publicImages / stats.totalImages) * 100)
    : 0
  const captionPublicPct = stats.totalCaptions > 0
    ? Math.round((stats.publicCaptions / stats.totalCaptions) * 100)
    : 0
  const avgCaptionsPerImage = stats.totalImages > 0
    ? (stats.totalCaptions / stats.totalImages).toFixed(1)
    : '0'
  const avgVotesPerCaption = stats.totalCaptions > 0
    ? (stats.totalVotes / stats.totalCaptions).toFixed(1)
    : '0'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Platform overview</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} sub={`${stats.universityCount} universities`} />
        <StatCard label="Total Images" value={stats.totalImages} sub={`${imagePublicPct}% public`} />
        <StatCard label="Total Captions" value={stats.totalCaptions} sub={`${captionPublicPct}% public`} />
        <StatCard label="Caption Votes" value={stats.totalVotes} sub={`${avgVotesPerCaption} avg per caption`} />
        <StatCard label="Total Shares" value={stats.totalShares} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Caption Likes" value={stats.totalLikes} />
        <StatCard label="Featured Captions" value={stats.featuredCaptions} />
        <StatCard label="Common Use Images" value={stats.commonUseImages} />
        <StatCard label="Avg Captions/Image" value={avgCaptionsPerImage} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top captioned images */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Most Captioned Images</h2>
          <div className="space-y-3">
            {stats.topCaptionedImages.map(({ id, count, image }, i) => (
              <div key={id} className="flex items-center gap-3">
                <span className="text-gray-600 text-sm w-5">{i + 1}.</span>
                {image?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-xs truncate">
                    {image?.image_description?.slice(0, 80) || id.slice(0, 8) + '...'}
                  </p>
                </div>
                <span className="text-indigo-400 text-sm font-semibold flex-shrink-0">{count} captions</span>
              </div>
            ))}
            {stats.topCaptionedImages.length === 0 && (
              <p className="text-gray-500 text-sm">No data</p>
            )}
          </div>
        </div>

        {/* Top liked captions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Top Liked Captions</h2>
          <div className="space-y-3">
            {stats.topLikedCaptions.map((c: { content: string; like_count: number }, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-gray-600 text-sm w-5 flex-shrink-0">{i + 1}.</span>
                <p className="text-gray-300 text-xs flex-1 leading-relaxed">{c.content}</p>
                <span className="text-pink-400 text-sm font-semibold flex-shrink-0">{c.like_count} ♥</span>
              </div>
            ))}
            {stats.topLikedCaptions.length === 0 && (
              <p className="text-gray-500 text-sm">No data</p>
            )}
          </div>
        </div>
      </div>

      {/* Content health */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Content Visibility</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Public Images</span>
              <span className="text-gray-300">{stats.publicImages} / {stats.totalImages} ({imagePublicPct}%)</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${imagePublicPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Public Captions</span>
              <span className="text-gray-300">{stats.publicCaptions} / {stats.totalCaptions} ({captionPublicPct}%)</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${captionPublicPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Common Use Images</span>
              <span className="text-gray-300">{stats.commonUseImages} / {stats.totalImages} ({stats.totalImages > 0 ? Math.round(stats.commonUseImages / stats.totalImages * 100) : 0}%)</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${stats.totalImages > 0 ? Math.round(stats.commonUseImages / stats.totalImages * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent captions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Recent Captions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="pb-2 pr-4 font-medium">Caption</th>
                <th className="pb-2 pr-4 font-medium">Likes</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stats.recentCaptions.map((c: {
                content: string
                like_count: number
                is_public: boolean
                is_featured: boolean
                created_datetime_utc: string
              }, i: number) => (
                <tr key={i} className="text-gray-300">
                  <td className="py-2.5 pr-4 max-w-xs truncate">{c.content}</td>
                  <td className="py-2.5 pr-4 text-pink-400">{c.like_count}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex gap-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${c.is_public ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                        {c.is_public ? 'public' : 'private'}
                      </span>
                      {c.is_featured && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">featured</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-500 text-xs">
                    {new Date(c.created_datetime_utc).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
