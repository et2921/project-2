import { createClient } from '@/lib/supabase/server'
import CrudTable, { type Field } from '../components/CrudTable'

const fields: Field[] = [
  { key: 'id', label: 'ID', readOnly: true },
  { key: 'email_address', label: 'Email Address', type: 'email' },
]

export default async function WhitelistEmailsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('whitelist_email_addresses')
    .select('id, email_address, created_datetime_utc, modified_datetime_utc')
    .order('email_address', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Whitelisted Emails</h1>
        <p className="text-gray-400 text-sm mt-1">Individual emails allowed to sign up</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error.message}</div>}
      <CrudTable table="whitelist_email_addresses" rows={data ?? []} fields={fields} title="Whitelist Emails" />
    </div>
  )
}
