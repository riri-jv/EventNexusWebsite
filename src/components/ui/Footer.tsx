import Link from 'next/link';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            EventNexus helps you discover and book the best events in your city.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/careers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">Support</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} EventNexus. All rights reserved.
        </div>
      </div>
    </footer>
  );
}