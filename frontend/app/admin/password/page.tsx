'use client';

import { useState, type FormEvent } from 'react';
import { changeAdminPassword } from '@/lib/admin-store';

const INPUT_CLASS =
  'mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

export default function AdminPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    if (!currentPassword || !newPassword) {
      setError('Current and new passwords are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    try {
      await changeAdminPassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change the password.');
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-indigo-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Change admin password</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        You must be signed in as an admin to change your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="currentPassword" className={LABEL_CLASS}>
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="newPassword" className={LABEL_CLASS}>
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={LABEL_CLASS}>
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
            Password changed successfully.
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
        >
          Change password
        </button>
      </form>
    </div>
  );
}
