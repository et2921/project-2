import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNav userEmail={user.email ?? ''} />
      <main className="ml-52 px-6 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  )
}
