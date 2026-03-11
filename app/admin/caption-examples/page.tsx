import { createClient } from '@/lib/supabase/server'
import CrudTable, { type Field } from '../components/CrudTable'

const fields: Field[] = [
  { key: 'id', label: 'ID', readOnly: true },
  { key: 'caption', label: 'Caption', type: 'textarea' },
  { key: 'explanation', label: 'Explanation', type: 'textarea' },
  { key: 'image_description', label: 'Image Description', type: 'textarea' },
  { key: 'priority', label: 'Priority', type: 'number' },
  { key: 'image_id', label: 'Image ID' },
]

export default async function CaptionExamplesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('caption_examples')
    .select('id, caption, explanation, image_description, priority, image_id')
    .order('id', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Caption Examples</h1>
        <p className="text-gray-400 text-sm mt-1">Example captions used for training</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <CrudTable table="caption_examples" rows={data ?? []} fields={fields} title="Caption Examples" orderBy="id" />
    </div>
  )
}
