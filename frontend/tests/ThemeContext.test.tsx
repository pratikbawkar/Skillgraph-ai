import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from '@/lib/theme-context';

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      current-theme:{theme}
    </button>
  );
}

describe('ThemeProvider / useTheme', () => {
  it('defaults to light and persists the toggled theme to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(await screen.findByText('current-theme:light')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('current-theme:dark')).toBeInTheDocument();
    expect(window.localStorage.getItem('skillgraph.theme')).toBe('dark');
  });

  it('throws when useTheme is used outside a ThemeProvider', () => {
    function Broken() {
      useTheme();
      return null;
    }

    expect(() => render(<Broken />)).toThrow('useTheme must be used within a ThemeProvider');
  });
});
