// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { type Metadata } from 'next'
import Header from '../components/Header'
import { ThemeProvider } from 'next-themes'
import { Footer } from '../components/ui/Footer'


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'EventNexus',
  description: 'EventNexus - Explore, Connect, Attend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[#121212] text-black dark:text-white`}
        >
          {/* Wrap the entire UI in ThemeProvider ONCE here */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <Header />
  <main className="max-w-7xl mx-auto px-4 py-6">
    {children}
  </main>
  <Footer />
</ThemeProvider>

        </body>
      </html>
    </ClerkProvider>
  )
}
