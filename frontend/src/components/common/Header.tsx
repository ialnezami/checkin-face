'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Check-In System
          </Link>
          <nav className="flex space-x-4">
            <Link
              href="/checkin"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/checkin')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Check-In
            </Link>
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/admin')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Admin
            </Link>
            <Link
              href="/employee/login"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/employee')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Employee Portal
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

