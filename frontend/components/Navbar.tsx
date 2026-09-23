'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-brand">
          SkillGraph
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-700 hover:text-brand">
            Roles
          </Link>
          <Link href="/evidence" className="text-gray-700 hover:text-brand">
            Submit Evidence
          </Link>
          {!isLoading && user ? (
            <>
              <span className="text-gray-500">{user.displayName}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50"
              >
                Log out
              </button>
            </>
          ) : (
            !isLoading && (
              <>
                <Link href="/login" className="text-gray-700 hover:text-brand">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark"
                >
                  Register
                </Link>
              </>
            )
          )}
        </div>
      </nav>
    </header>
  );
}
