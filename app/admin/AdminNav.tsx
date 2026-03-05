'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/images', label: 'Images' },
  { href: '/admin/captions', label: 'Captions' },
]

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <span className="text-white font-semibold mr-4 text-sm">⚡ Admin</span>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
