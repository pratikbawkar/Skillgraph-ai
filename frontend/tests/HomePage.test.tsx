import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders a link for every curated role', async () => {
    render(await HomePage());

    expect(screen.getByText(/Cloud Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/DevOps Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Python Developer/i)).toBeInTheDocument();
  });

  it('links each role card to its skill graph page', async () => {
    render(await HomePage());

    const links = screen.getAllByRole('link');
    expect(links.some((link) => link.getAttribute('href')?.startsWith('/roles/'))).toBe(true);
  });
});
