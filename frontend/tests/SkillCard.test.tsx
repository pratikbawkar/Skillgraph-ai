import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SkillCard } from '@/components/SkillCard';
import type { Skill, SkillProgress } from '@/lib/types';

const skill: Skill = {
  id: 'test-skill',
  name: 'Test Skill',
  category: 'Testing',
  description: 'A skill used for testing.',
  importance: 'core',
  difficulty: 'beginner',
  prerequisites: [],
  learningResource: {
    skillId: 'test-skill',
    videoTitle: 'Intro to Test Skill',
    youtubeUrl: 'https://www.youtube.com/watch?v=test',
    curatedBy: 'test-owner',
  },
};

const progress: SkillProgress = {
  skillId: 'test-skill',
  breakdown: {
    selfAssessment: 20,
    objectiveQuiz: 0,
    practicalProject: 30,
    evidenceSubmitted: 0,
  },
  totalPercentage: 50,
};

describe('SkillCard', () => {
  it('shows the skill name and deterministic progress breakdown', () => {
    render(<SkillCard skill={skill} progress={progress} />);
    expect(screen.getByText('Test Skill')).toBeInTheDocument();
    expect(screen.getByText('20/20')).toBeInTheDocument();
    expect(screen.getByText('30/30')).toBeInTheDocument();
    expect(screen.getByText('0/30')).toBeInTheDocument();
    expect(screen.getByText('0/20')).toBeInTheDocument();
  });

  it('hides the learning resource until the info control is toggled', async () => {
    const user = userEvent.setup();
    render(<SkillCard skill={skill} progress={progress} />);

    expect(screen.queryByText('Intro to Test Skill')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /skill details for test skill/i }));

    expect(screen.getByText(/Intro to Test Skill/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=test'
    );
  });
});
