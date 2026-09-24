import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});

function renderNavbar() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('Navbar', () => {
  it('shows log in and register links when unauthenticated', async () => {
    renderNavbar();

    expect(await screen.findByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('toggles the theme when the theme button is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const button = await screen.findByRole('button', { name: /switch to dark mode/i });
    await user.click(button);

    expect(
      await screen.findByRole('button', { name: /switch to light mode/i })
    ).toBeInTheDocument();
  });
});
