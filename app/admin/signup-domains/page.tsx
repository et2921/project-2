import { createClient } from '@/lib/supabase/server'
import CrudTable, { type Field } from '../components/CrudTable'

const fields: Field[] = [
  { key: 'id', label: 'ID', readOnly: true },
  { key: 'apex_domain', label: 'Domain (e.g. columbia.edu)' },
]

export default async function SignupDomainsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('allowed_signup_domains')
    .select('id, apex_domain, created_datetime_utc')
    .order('apex_domain', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Allowed Signup Domains</h1>
        <p className="text-gray-400 text-sm mt-1">Email domains allowed to sign up</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <CrudTable table="allowed_signup_domains" rows={data ?? []} fields={fields} title="Signup Domains" />
    </div>
  )
}
