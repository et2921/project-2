import { createClient } from '@/lib/supabase/server'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false, nullsFirst: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{profiles?.length ?? 0} profiles</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          Error loading profiles: {error.message}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-800/50 border-b border-gray-800">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Superadmin</th>
                <th className="px-4 py-3 font-medium">Matrix Admin</th>
                <th className="px-4 py-3 font-medium">In Study</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {profiles?.map((profile) => (
                <tr key={profile.id} className="text-gray-300 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{profile.id}</td>
                  <td className="px-4 py-3">
                    <Badge value={profile.is_superadmin} trueColor="indigo" />
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={profile.is_matrix_admin} trueColor="purple" />
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={profile.is_in_study} trueColor="emerald" />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
              {(!profiles || profiles.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No profiles found (RLS may be restricting access)
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

function Badge({ value, trueColor }: { value: boolean | null; trueColor: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    purple: 'bg-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
  }
  if (value) {
    return (
      <span className={`text-xs px-2 py-0.5 rounded font-medium ${colorMap[trueColor]}`}>
        Yes
      </span>
    )
  }
  return <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-500">No</span>
}
