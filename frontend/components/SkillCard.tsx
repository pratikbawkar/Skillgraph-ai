'use client';

import { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { SKILL_PROGRESS_WEIGHTS, type Skill, type SkillProgress } from '@/lib/types';

interface SkillCardProps {
  skill: Skill;
  progress: SkillProgress;
}

const IMPORTANCE_STYLES: Record<Skill['importance'], string> = {
  core: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  important: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  'nice-to-have': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const DIFFICULTY_STYLES: Record<Skill['difficulty'], string> = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  intermediate: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
};

export function SkillCard({ skill, progress }: SkillCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const { breakdown } = progress;

  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{skill.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500">{skill.category}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${DIFFICULTY_STYLES[skill.difficulty]}`}
            >
              {skill.difficulty}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${IMPORTANCE_STYLES[skill.importance]}`}
            >
              {skill.importance}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo((value) => !value)}
          aria-label={`Skill details for ${skill.name}`}
          aria-expanded={showInfo}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-200 text-xs font-semibold text-brand hover:bg-indigo-50 dark:border-gray-700 dark:text-brand-light dark:hover:bg-gray-800"
        >
          i
        </button>
      </div>

      <div className="mt-3">
        <ProgressBar percentage={progress.totalPercentage} label="Skill progress" />
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
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
        <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-sm dark:border-gray-800 dark:bg-gray-800/60">
          <p className="text-gray-700 dark:text-gray-300">{skill.description}</p>
          <a
            href={skill.learningResource.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-medium text-brand hover:underline dark:text-brand-light"
          >
            ▶ {skill.learningResource.videoTitle}
          </a>
          {skill.learningResource.note && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {skill.learningResource.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
