import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { SuggestedProjectCard } from '@/components/SuggestedProjectCard';
import type { SuggestedProject } from '@/lib/types';

const project: SuggestedProject = {
  id: 'test-project',
  title: 'Test Project',
  description: 'A project used for testing.',
  relatedSkillIds: [],
};

describe('SuggestedProjectCard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('lets a user suggest a tutorial video and lists it', async () => {
    const user = userEvent.setup();
    render(
      <ul>
        <SuggestedProjectCard project={project} />
      </ul>
    );

    expect(screen.queryByLabelText('Tutorial video URL')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /suggest a tutorial video for test project/i }));
    await user.type(screen.getByLabelText('Tutorial video URL'), 'https://www.youtube.com/watch?v=abc');
    await user.click(screen.getByRole('button', { name: /submit suggestion/i }));

    expect(
      screen.getByRole('link', { name: 'https://www.youtube.com/watch?v=abc' })
    ).toBeInTheDocument();
  });
});
