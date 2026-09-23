import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import EvidencePage from '@/app/evidence/page';

describe('EvidencePage', () => {
  it('shows a loading state before skills are available', () => {
    render(<EvidencePage />);
    expect(screen.getByText(/loading skills/i)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    render(<EvidencePage />);

    await waitFor(() => expect(screen.getByLabelText(/skill/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /submit evidence/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Please select a skill.');
  });
});
