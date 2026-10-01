import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const store = vi.hoisted(() => ({
  loginAdmin: vi.fn(),
  changeAdminPassword: vi.fn(),
}));
vi.mock('@/lib/admin-store', () => store);

import AdminLoginPage from '@/app/admin/login/page';
import AdminPasswordPage from '@/app/admin/password/page';

describe('AdminLoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects home after a successful async login', async () => {
    const user = userEvent.setup();
    store.loginAdmin.mockResolvedValue(true);
    render(<AdminLoginPage />);
    await user.type(screen.getByLabelText('Username'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'pw');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(store.loginAdmin).toHaveBeenCalledWith('admin@example.com', 'pw');
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/'));
  });

  it('shows the authentication error message', async () => {
    const user = userEvent.setup();
    store.loginAdmin.mockRejectedValue(new Error('Incorrect username or password.'));
    render(<AdminLoginPage />);
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect username or password.');

    store.loginAdmin.mockResolvedValue(false);
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect admin username or password.');
    expect(push).not.toHaveBeenCalled();
  });
});

describe('AdminPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks());

  async function fill(user: ReturnType<typeof userEvent.setup>, confirm: string) {
    await user.type(screen.getByLabelText('Current password'), 'old');
    await user.type(screen.getByLabelText('New password'), 'newer');
    await user.type(screen.getByLabelText('Confirm new password'), confirm);
    await user.click(screen.getByRole('button', { name: /change password/i }));
  }

  it('rejects mismatched confirmation without calling Cognito', async () => {
    const user = userEvent.setup();
    render(<AdminPasswordPage />);
    await fill(user, 'different');
    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match/);
    expect(store.changeAdminPassword).not.toHaveBeenCalled();
  });

  it('requires the current and new password', async () => {
    const user = userEvent.setup();
    render(<AdminPasswordPage />);
    await user.click(screen.getByRole('button', { name: /change password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/required/);
  });

  it('shows success and clears the fields', async () => {
    const user = userEvent.setup();
    store.changeAdminPassword.mockResolvedValue(undefined);
    render(<AdminPasswordPage />);
    await fill(user, 'newer');
    expect(store.changeAdminPassword).toHaveBeenCalledWith('old', 'newer');
    expect(await screen.findByRole('status')).toHaveTextContent(/changed successfully/i);
    expect(screen.getByLabelText('Current password')).toHaveValue('');
  });

  it('shows Cognito errors', async () => {
    const user = userEvent.setup();
    store.changeAdminPassword.mockRejectedValue(new Error('Incorrect username or password.'));
    render(<AdminPasswordPage />);
    await fill(user, 'newer');
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect username or password.');
  });
});
