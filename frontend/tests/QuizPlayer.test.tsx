import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { QuizPlayer } from '@/components/QuizPlayer';
import { getQuizResult } from '@/lib/progress-store';
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

describe('QuizPlayer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('scores the quiz, persists the result, and links back to the skill', async () => {
    const user = userEvent.setup();
    render(<QuizPlayer roleId="test-role" skillId="test-skill" skillName="Test Skill" quiz={quiz} />);

    const checkButton = screen.getByRole('button', { name: /check answers/i });
    expect(checkButton).toBeDisabled();

    await user.click(screen.getByLabelText('4'));
    expect(checkButton).toBeEnabled();

    await user.click(checkButton);
    expect(screen.getByText('Score: 1/1')).toBeInTheDocument();
    expect(getQuizResult('test-role', 'test-skill')).toEqual({ correctCount: 1, totalQuestions: 1 });
    expect(screen.getByRole('link', { name: /back to test skill/i })).toHaveAttribute(
      'href',
      '/roles/test-role/skills/test-skill'
    );
  });
});
