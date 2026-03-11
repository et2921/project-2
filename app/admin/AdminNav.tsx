'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const sections = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard' },
    ],
  },
  {
    label: 'Users & Access',
    items: [
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/signup-domains', label: 'Signup Domains' },
      { href: '/admin/whitelist-emails', label: 'Whitelist Emails' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/images', label: 'Images' },
      { href: '/admin/captions', label: 'Captions' },
      { href: '/admin/caption-examples', label: 'Caption Examples' },
      { href: '/admin/caption-requests', label: 'Caption Requests' },
      { href: '/admin/terms', label: 'Terms' },
    ],
  },
  {
    label: 'Humor',
    items: [
      { href: '/admin/humor-flavors', label: 'Humor Flavors' },
      { href: '/admin/humor-flavor-steps', label: 'Flavor Steps' },
      { href: '/admin/humor-mix', label: 'Humor Mix' },
    ],
  },
  {
    label: 'LLM',
    items: [
      { href: '/admin/llm-providers', label: 'Providers' },
      { href: '/admin/llm-models', label: 'Models' },
      { href: '/admin/llm-prompt-chains', label: 'Prompt Chains' },
      { href: '/admin/llm-responses', label: 'Responses' },
    ],
  },
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
    <aside className="fixed top-0 left-0 h-screen w-52 bg-gray-900 border-r border-gray-800 flex flex-col z-10">
      <div className="px-4 py-4 border-b border-gray-800">
        <span className="text-white font-bold text-sm">⚡ Admin Panel</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {sections.map(section => (
          <div key={section.label} className="mb-4">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {section.label}
            </p>
            {section.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-1.5 text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-gray-500 text-xs truncate mb-2">{userEmail}</p>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
