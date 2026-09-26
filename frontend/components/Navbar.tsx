'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { isAdminLoggedIn, logoutAdmin } from '@/lib/admin-store';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn());
  }, []);

  return (
    <header className="border-b border-indigo-100 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-bold text-brand dark:text-brand-light"
        >
          Skill Orbit
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-gray-600 hover:text-brand dark:text-gray-300 dark:hover:text-brand-light"
          >
            Roles
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 text-base hover:bg-indigo-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                logoutAdmin();
                setIsAdmin(false);
              }}
              className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Admin logout
            </button>
          ) : (
            <Link
              href="/admin/login"
              className="text-xs text-gray-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand-light"
            >
              Admin
            </Link>
          )}

          {!isLoading && user ? (
            <>
              <span className="text-gray-500 dark:text-gray-400">{user.displayName}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Log out
              </button>
            </>
          ) : (
            !isLoading && (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-brand dark:text-gray-300 dark:hover:text-brand-light"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-brand to-brand-dark px-4 py-1.5 font-medium text-white shadow-sm hover:opacity-90"
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
