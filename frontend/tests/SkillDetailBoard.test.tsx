import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { SkillDetailBoard } from '@/components/SkillDetailBoard';
import { getQuizForSkill } from '@/lib/quiz-data';
import { getRoleById, getMockRoleProgress } from '@/lib/mock-data';

describe('SkillDetailBoard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('updates the progress bar immediately when marking the skill complete', async () => {
    const user = userEvent.setup();
    const role = getRoleById('cloud-engineer')!;
    const skill = role.skills[0];
    const progress = getMockRoleProgress('cloud-engineer').skillProgress.find(
      (sp) => sp.skillId === skill.id
    )!;

    render(<SkillDetailBoard role={role} skill={skill} progress={progress} />);

    const progressbar = await screen.findByRole('progressbar');
    const initialValue = progressbar.getAttribute('aria-valuenow');

    await user.click(screen.getByRole('button', { name: new RegExp(`mark ${skill.name} as completed`, 'i') }));

    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    expect(progressbar.getAttribute('aria-valuenow')).not.toBe(initialValue);
  });

  it('links to the dedicated quiz page instead of starting the quiz inline', async () => {
    const role = getRoleById('python-developer')!;
    const skill = role.skills.find((s) => s.id === 'pd-testing')!;
    const progress = getMockRoleProgress(role.id).skillProgress.find((sp) => sp.skillId === skill.id)!;
    const quiz = getQuizForSkill(skill.id)!;

    render(<SkillDetailBoard role={role} skill={skill} progress={progress} quiz={quiz} />);

    const link = screen.getByRole('link', { name: /start quiz/i });
    expect(link).toHaveAttribute('href', `/roles/${role.id}/skills/${skill.id}/quiz`);
  });

  it('updates the progress bar immediately after marking the recommended video as watched', async () => {
    const user = userEvent.setup();
    const role = getRoleById('cloud-engineer')!;
    // Skip index 0: its mock selfAssessment value is already at the full
    // weight, which would make "watched" a no-op for this assertion.
    const skill = role.skills[1];
    const progress = getMockRoleProgress('cloud-engineer').skillProgress.find(
      (sp) => sp.skillId === skill.id
    )!;

    render(<SkillDetailBoard role={role} skill={skill} progress={progress} />);

    expect(screen.getByRole('heading', { name: 'Recommended video' })).toBeInTheDocument();
    expect(screen.getByText('Recommended video', { selector: 'dt' })).toBeInTheDocument();
    expect(screen.queryByText('Self-assessment')).not.toBeInTheDocument();

    const progressbar = await screen.findByRole('progressbar');
    const beforeValue = Number(progressbar.getAttribute('aria-valuenow'));

    await user.click(screen.getByRole('button', { name: /mark video watched/i }));

    expect(Number(progressbar.getAttribute('aria-valuenow'))).toBeGreaterThan(beforeValue);
  });

  it('credits the practical project after a GitHub link is submitted, and never shows an evidence section', async () => {
    const user = userEvent.setup();
    const role = getRoleById('python-developer')!;
    const skill = role.skills.find((s) => s.id === 'pd-testing')!;
    const progress = getMockRoleProgress(role.id).skillProgress.find((sp) => sp.skillId === skill.id)!;

    render(<SkillDetailBoard role={role} skill={skill} progress={progress} />);

    expect(screen.queryByText(/evidence submitted/i)).not.toBeInTheDocument();

    const progressbar = await screen.findByRole('progressbar');
    const beforeValue = Number(progressbar.getAttribute('aria-valuenow'));

    await user.type(screen.getByLabelText('GitHub repository URL'), 'https://github.com/me/project');
    await user.click(screen.getByRole('button', { name: /submit for review/i }));

    expect(screen.getByText(/pending admin review/i)).toBeInTheDocument();
    expect(Number(progressbar.getAttribute('aria-valuenow'))).toBeGreaterThan(beforeValue);
  });
});
