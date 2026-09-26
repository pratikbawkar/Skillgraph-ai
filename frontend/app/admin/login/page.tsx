'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { loginAdmin } from '@/lib/admin-store';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loginAdmin(username.trim(), password)) {
      router.push('/');
    } else {
      setError('Incorrect admin username or password.');
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-indigo-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Admin login</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Sign in to edit recommended videos for any skill.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
