import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoleSkillsBoard } from '@/components/RoleSkillsBoard';
import { setSkillCompletion } from '@/lib/progress-store';
import { getRoleById, getMockRoleProgress } from '@/lib/mock-data';

describe('RoleSkillsBoard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it(
    'renders an overall progress bar and a roadmap link for every skill',
    async () => {
      const role = getRoleById('cloud-engineer')!;
      const progress = getMockRoleProgress('cloud-engineer');
      const progressBySkillId = new Map(progress.skillProgress.map((sp) => [sp.skillId, sp]));

      render(<RoleSkillsBoard role={role} progressBySkillId={progressBySkillId} />);

      expect(await screen.findByText(/overall role progress/i)).toBeInTheDocument();
      role.skills.forEach((skill) => {
        const link = screen.getByRole('link', { name: new RegExp(skill.name, 'i') });
        expect(link).toHaveAttribute('href', `/roles/${role.id}/skills/${skill.id}`);
      });
    },
    15000
  );

  it(
    'reflects a skill already marked complete (via localStorage) as a green roadmap step and a higher overall percentage',
    async () => {
      const role = getRoleById('cloud-engineer')!;
      const progress = getMockRoleProgress('cloud-engineer');
      const progressBySkillId = new Map(progress.skillProgress.map((sp) => [sp.skillId, sp]));
      const firstSkill = role.skills[0];

      setSkillCompletion(role.id, firstSkill.id, true);

      render(<RoleSkillsBoard role={role} progressBySkillId={progressBySkillId} />);

      const link = await screen.findByRole('link', { name: new RegExp(firstSkill.name, 'i') });
      expect(link.className).toContain('border-emerald-400');
      expect(link.textContent).toContain('100%');
    },
    15000
  );
});
