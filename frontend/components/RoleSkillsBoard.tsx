'use client';

import { useEffect, useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { SkillRoadmap } from './SkillRoadmap';
import {
  computeEffectiveProgress,
  getCompletedSkillIds,
  getPracticalSubmission,
  getQuizResult,
  type PracticalSubmission,
  type QuizResult,
} from '@/lib/progress-store';
import type { Role, SkillProgress } from '@/lib/types';

interface RoleSkillsBoardProps {
  role: Role;
  progressBySkillId: Map<string, SkillProgress>;
}

/**
 * Reads local completion + quiz signals fresh on every mount (i.e. every
 * time a learner navigates back to this role) so the roadmap and overall
 * progress bar always reflect the latest state from the skill detail pages.
 */
export function RoleSkillsBoard({ role, progressBySkillId }: RoleSkillsBoardProps) {
  const [completedSkillIds, setCompletedSkillIds] = useState<Set<string>>(new Set());
  const [quizResultsBySkillId, setQuizResultsBySkillId] = useState<Map<string, QuizResult>>(new Map());
  const [practicalBySkillId, setPracticalBySkillId] = useState<Map<string, PracticalSubmission>>(new Map());

  useEffect(() => {
    setCompletedSkillIds(getCompletedSkillIds(role.id));
    setQuizResultsBySkillId(
      new Map(
        role.skills
          .map((skill) => [skill.id, getQuizResult(role.id, skill.id)] as const)
          .filter((entry): entry is [string, QuizResult] => Boolean(entry[1]))
      )
    );
    setPracticalBySkillId(
      new Map(
        role.skills
          .map((skill) => [skill.id, getPracticalSubmission(role.id, skill.id)] as const)
          .filter((entry): entry is [string, PracticalSubmission] => Boolean(entry[1]))
      )
    );
  }, [role.id, role.skills]);

  const effectiveProgressBySkillId = new Map(
    Array.from(progressBySkillId.entries()).map(([skillId, progress]) => [
      skillId,
      computeEffectiveProgress(
        progress,
        completedSkillIds.has(skillId),
        quizResultsBySkillId.get(skillId),
        practicalBySkillId.get(skillId)
      ),
    ])
  );

  const overallPercentage = role.skills.length
    ? Math.round(
        role.skills.reduce(
          (sum, skill) => sum + (effectiveProgressBySkillId.get(skill.id)?.totalPercentage ?? 0),
          0
        ) / role.skills.length
      )
    : 0;

  return (
    <div>
      <div className="mb-6 max-w-sm">
        <ProgressBar percentage={overallPercentage} label="Overall role progress" />
      </div>
      <SkillRoadmap role={role} progressBySkillId={effectiveProgressBySkillId} />
    </div>
  );
}
