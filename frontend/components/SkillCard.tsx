'use client';

import { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { SKILL_PROGRESS_WEIGHTS, type Skill, type SkillProgress } from '@/lib/types';

interface SkillCardProps {
  skill: Skill;
  progress: SkillProgress;
}

export function SkillCard({ skill, progress }: SkillCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const { breakdown } = progress;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-gray-900">{skill.name}</h3>
          <p className="text-xs text-gray-500">
            {skill.category} · {skill.difficulty} · {skill.importance}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo((value) => !value)}
          aria-label={`Skill details for ${skill.name}`}
          aria-expanded={showInfo}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          i
        </button>
      </div>

      <div className="mt-3">
        <ProgressBar percentage={progress.totalPercentage} label="Skill progress" />
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
        <div className="flex justify-between">
          <dt>Self-assessment</dt>
          <dd>
            {breakdown.selfAssessment}/{SKILL_PROGRESS_WEIGHTS.selfAssessment}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Objective quiz</dt>
          <dd>
            {breakdown.objectiveQuiz}/{SKILL_PROGRESS_WEIGHTS.objectiveQuiz}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Practical project</dt>
          <dd>
            {breakdown.practicalProject}/{SKILL_PROGRESS_WEIGHTS.practicalProject}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Evidence submitted</dt>
          <dd>
            {breakdown.evidenceSubmitted}/{SKILL_PROGRESS_WEIGHTS.evidenceSubmitted}
          </dd>
        </div>
      </dl>

      {showInfo && (
        <div className="mt-3 rounded border border-gray-100 bg-gray-50 p-3 text-sm">
          <p className="text-gray-700">{skill.description}</p>
          <a
            href={skill.learningResource.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-brand hover:underline"
          >
            ▶ {skill.learningResource.videoTitle}
          </a>
          {skill.learningResource.note && (
            <p className="mt-1 text-xs text-gray-500">{skill.learningResource.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
