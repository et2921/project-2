import { createClient } from '@/lib/supabase/server'
import ReadTable from '../components/ReadTable'

export default async function HumorFlavorsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('humor_flavors')
    .select('id, slug, description, created_datetime_utc')
    .order('id', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Humor Flavors</h1>
        <p className="text-gray-400 text-sm mt-1">{data?.length ?? 0} flavors</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <ReadTable
        rows={data ?? []}
        title="Humor Flavors"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'slug', label: 'Slug' },
          { key: 'description', label: 'Description', truncate: true },
          { key: 'created_datetime_utc', label: 'Created' },
        ]}
      />
    </div>
  )
}
