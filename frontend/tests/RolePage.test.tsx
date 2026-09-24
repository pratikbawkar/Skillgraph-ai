import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RolePage from '@/app/roles/[roleId]/page';

describe('RolePage', () => {
  it('renders the role name, progress, and skills for a known role', async () => {
    const ui = await RolePage({ params: Promise.resolve({ roleId: 'cloud-engineer' }) });
    render(ui);

    expect(screen.getByRole('heading', { name: /cloud engineer/i })).toBeInTheDocument();
    expect(screen.getByText(/overall role progress/i)).toBeInTheDocument();
  });

  it('renders suggested projects for cloud engineer role', async () => {
    const ui = await RolePage({ params: Promise.resolve({ roleId: 'cloud-engineer' }) });
    render(ui);

    expect(screen.getByText(/suggested projects/i)).toBeInTheDocument();
  });

  it('renders skills for devops engineer role', async () => {
    const ui = await RolePage({ params: Promise.resolve({ roleId: 'devops-engineer' }) });
    render(ui);

    expect(screen.getByRole('heading', { name: /devops engineer/i })).toBeInTheDocument();
  });
});
