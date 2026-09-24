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

  it('shows AI findings (not a pass/fail verdict) after a valid submission', async () => {
    const user = userEvent.setup();
    render(<EvidencePage />);

    await waitFor(() => expect(screen.getByLabelText(/skill/i)).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText(/skill/i), 'ce-networking-fundamentals');
    await user.type(screen.getByLabelText(/what did you build or learn/i), 'Built a small API.');
    await user.click(screen.getByRole('button', { name: /submit evidence/i }));

    expect(await screen.findByText('AI findings')).toBeInTheDocument();
    expect(screen.getByText(/confidence:/i)).toBeInTheDocument();
    expect(screen.getByText(/this is a summary, not a pass\/fail decision/i)).toBeInTheDocument();
  });
});
