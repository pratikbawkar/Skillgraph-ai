import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkillQuizSection } from '@/components/SkillQuizSection';
import type { SkillQuiz } from '@/lib/types';

const quiz: SkillQuiz = {
  skillId: 'test-skill',
  questions: [
    {
      id: 'q1',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5'],
      correctOptionIndex: 1,
    },
  ],
};

describe('SkillQuizSection', () => {
  it('shows the question count and links to the dedicated quiz page instead of starting inline', () => {
    render(
      <SkillQuizSection quiz={quiz} skillName="Test Skill" roleId="test-role" skillId="test-skill" />
    );

    expect(screen.getByText(/this quiz has 1 questions/i)).toBeInTheDocument();
    expect(screen.queryByText('What is 2 + 2?')).not.toBeInTheDocument();

    const link = screen.getByRole('link', { name: /start quiz/i });
    expect(link).toHaveAttribute('href', '/roles/test-role/skills/test-skill/quiz');
  });
});
