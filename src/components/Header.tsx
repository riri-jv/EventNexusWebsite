'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { SunIcon, MoonIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
      {/* Logo with potential logo image */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          EventNexus
        </span>
      </Link>

      {/* Navigation and Actions */}
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/events" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Events
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Categories
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-blue-600 transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}