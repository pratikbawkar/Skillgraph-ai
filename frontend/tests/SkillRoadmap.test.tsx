import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkillRoadmap } from '@/components/SkillRoadmap';
import { getRoleById, getMockRoleProgress } from '@/lib/mock-data';

describe('SkillRoadmap', () => {
  it('connects every skill to the next in a single chain ending at the role', () => {
    const role = getRoleById('cloud-engineer')!;
    const progress = getMockRoleProgress('cloud-engineer');
    const progressBySkillId = new Map(progress.skillProgress.map((sp) => [sp.skillId, sp]));

    render(<SkillRoadmap role={role} progressBySkillId={progressBySkillId} />);

    const items = screen.getAllByRole('listitem');
    const positionOf = (text: string) => items.findIndex((item) => item.textContent?.includes(text));

    role.skills.forEach((skill) => {
      expect(positionOf(skill.name)).toBeGreaterThanOrEqual(0);
      skill.prerequisites.forEach((prereqId) => {
        const prereq = role.skills.find((s) => s.id === prereqId);
        if (!prereq) return;
        expect(positionOf(prereq.name)).toBeLessThan(positionOf(skill.name));
      });
    });

    // The role node is the final step in the chain.
    expect(items[items.length - 1].textContent).toContain(role.name);
    expect(items[items.length - 1].textContent).toContain('You become a');
  });

  it('renders a role with no skills as just the role node', () => {
    const role = { ...getRoleById('cloud-engineer')!, skills: [] };
    render(<SkillRoadmap role={role} progressBySkillId={new Map()} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('You become a');
  });
});
