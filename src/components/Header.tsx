'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicRoles } from '@/types/globals';

const roles = ["attendee", "organizer", "sponsor"];

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<PublicRoles>('attendee');

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <header className="w-full px-4 py-4 shadow-sm bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EventNexus
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Right: Theme Toggle + Auth */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          <SignedOut>
            <Select onValueChange={(value) => setRole(value as PublicRoles)} defaultValue="attendee">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="attendee" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((rl) => (
                  <SelectItem key={rl} value={rl}>
                    {rl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton
              mode="modal"
              unsafeMetadata={{ role }}
            >
              <button className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
  );
}
