import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RegisterPage from '@/app/register/page';
import { AuthProvider } from '@/lib/auth-context';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderRegisterPage() {
  return render(
    <AuthProvider>
      <RegisterPage />
    </AuthProvider>
  );
}

describe('RegisterPage', () => {
  it('requires all fields', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Name, email, and password are required.'
    );
  });

  it('rejects passwords shorter than 8 characters', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Password must be at least 8 characters.'
    );
  });
});
