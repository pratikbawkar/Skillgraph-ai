import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders the rounded percentage and label', () => {
    render(<ProgressBar percentage={42.6} label="Skill progress" />);
    expect(screen.getByText('Skill progress')).toBeInTheDocument();
    expect(screen.getByText('43%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '43');
  });

  it('clamps values above 100 and below 0', () => {
    const { rerender } = render(<ProgressBar percentage={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<ProgressBar percentage={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});
