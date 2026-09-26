'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CelebrationBurst } from './CelebrationBurst';
import { ProgressBar } from './ProgressBar';
import { SkillQuizSection } from './SkillQuizSection';
import { getVideoOverride, isAdminLoggedIn, setVideoOverride, type VideoOverride } from '@/lib/admin-store';
import {
  computeEffectiveProgress,
  getCompletedSkillIds,
  getPracticalSubmission,
  getQuizResult,
  getVideoWatched,
  setPracticalSubmission,
  setSkillCompletion,
  setVideoWatched,
  type PracticalSubmission,
  type QuizResult,
} from '@/lib/progress-store';
import { SKILL_PROGRESS_WEIGHTS, type Role, type Skill, type SkillProgress, type SkillQuiz } from '@/lib/types';

interface VideoSuggestion {
  videoUrl: string;
  note: string;
}

function videoSuggestionStorageKey(skillId: string) {
  return `skillorbit.videoSuggestions.skill.${skillId}`;
}

interface SkillDetailBoardProps {
  role: Role;
  skill: Skill;
  progress: SkillProgress;
  quiz?: SkillQuiz;
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

export function SkillDetailBoard({ role, skill, progress, quiz }: SkillDetailBoardProps) {
  const [completed, setCompleted] = useState(false);
  const [quizResult, setQuizResultState] = useState<QuizResult | undefined>(undefined);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoNote, setVideoNote] = useState('');
  const [videoSuggestions, setVideoSuggestions] = useState<VideoSuggestion[]>([]);
  const [practicalSubmission, setPracticalSubmissionState] = useState<PracticalSubmission | undefined>(
    undefined
  );
  const [githubUrlInput, setGithubUrlInput] = useState('');
  const [videoWatched, setVideoWatchedState] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [videoOverride, setVideoOverrideState] = useState<VideoOverride | undefined>(undefined);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminTitle, setAdminTitle] = useState('');
  const [adminUrl, setAdminUrl] = useState('');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    setCompleted(getCompletedSkillIds(role.id).has(skill.id));
    setQuizResultState(getQuizResult(role.id, skill.id));
    setPracticalSubmissionState(getPracticalSubmission(role.id, skill.id));
    setVideoWatchedState(getVideoWatched(role.id, skill.id));
    setIsAdmin(isAdminLoggedIn());
    setVideoOverrideState(getVideoOverride(skill.id));
    try {
      const raw = window.localStorage.getItem(videoSuggestionStorageKey(skill.id));
      setVideoSuggestions(raw ? (JSON.parse(raw) as VideoSuggestion[]) : []);
    } catch {
      setVideoSuggestions([]);
    }
  }, [role.id, skill.id]);

  const video = videoOverride ?? {
    videoTitle: skill.learningResource.videoTitle,
    youtubeUrl: skill.learningResource.youtubeUrl,
    note: skill.learningResource.note,
  };

  function toggleVideoWatched() {
    setVideoWatchedState((prev) => {
      const next = !prev;
      setVideoWatched(role.id, skill.id, next);
      return next;
    });
  }

  function handleAdminVideoSubmit(event: FormEvent) {
    event.preventDefault();
    if (!adminTitle.trim() || !adminUrl.trim()) return;
    const override: VideoOverride = { videoTitle: adminTitle.trim(), youtubeUrl: adminUrl.trim(), note: adminNote.trim() || undefined };
    setVideoOverride(skill.id, override);
    setVideoOverrideState(override);
    setShowAdminForm(false);
  }

  function toggleCompleted() {
    setCompleted((prev) => {
      const next = !prev;
      setSkillCompletion(role.id, skill.id, next);
      if (next) setCelebrateKey((count) => count + 1);
      return next;
    });
  }

  function handleVideoSuggestionSubmit(event: FormEvent) {
    event.preventDefault();
    if (!videoUrl.trim()) return;
    const next = [...videoSuggestions, { videoUrl: videoUrl.trim(), note: videoNote.trim() }];
    setVideoSuggestions(next);
    window.localStorage.setItem(videoSuggestionStorageKey(skill.id), JSON.stringify(next));
    setVideoUrl('');
    setVideoNote('');
  }

  function handlePracticalSubmit(event: FormEvent) {
    event.preventDefault();
    if (!githubUrlInput.trim()) return;
    const submission = setPracticalSubmission(role.id, skill.id, githubUrlInput.trim());
    setPracticalSubmissionState(submission);
    setGithubUrlInput('');
  }

  const effectiveProgress = computeEffectiveProgress(
    progress,
    completed,
    quizResult,
    practicalSubmission,
    videoWatched
  );
  const { breakdown } = effectiveProgress;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{skill.name}</h1>
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
            onClick={toggleCompleted}
            aria-label={completed ? `Mark ${skill.name} as not completed` : `Mark ${skill.name} as completed`}
            aria-pressed={completed}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
              completed
                ? 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'border-amber-400 text-amber-500 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-900/20'
            }`}
          >
            ✓
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{skill.description}</p>

        <div className="mt-4">
          <ProgressBar percentage={effectiveProgress.totalPercentage} label="Skill progress" />
        </div>

        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-3">
          <div className="flex justify-between">
            <dt>Recommended video</dt>
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
        </dl>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-2">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Recommended video
          </h2>
          <div className="flex shrink-0 items-center gap-1.5">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowAdminForm((value) => !value)}
                aria-label={`Edit recommended video for ${skill.name} (admin)`}
                aria-expanded={showAdminForm}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-300 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                ✎
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowVideoForm((value) => !value)}
              aria-label={`Suggest a tutorial video for ${skill.name}`}
              aria-expanded={showVideoForm}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-indigo-200 text-xs font-semibold text-brand hover:bg-indigo-50 dark:border-gray-700 dark:text-brand-light dark:hover:bg-gray-800"
            >
              i
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block font-medium text-brand hover:underline dark:text-brand-light"
          >
            ▶ {video.videoTitle}
          </a>
          <button
            type="button"
            onClick={toggleVideoWatched}
            aria-pressed={videoWatched}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
              videoWatched
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {videoWatched ? '✓ Watched' : 'Mark video watched'}
          </button>
        </div>
        {video.note && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{video.note}</p>}

        {showAdminForm && (
          <form
            onSubmit={handleAdminVideoSubmit}
            className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-900/10"
          >
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Admin: set recommended video</p>
            <input
              type="text"
              required
              value={adminTitle}
              onChange={(event) => setAdminTitle(event.target.value)}
              placeholder="Video title"
              aria-label="Admin video title"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="url"
              required
              value={adminUrl}
              onChange={(event) => setAdminUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              aria-label="Admin video URL"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              placeholder="Optional note"
              aria-label="Admin video note"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
            >
              Save video
            </button>
          </form>
        )}

        {showVideoForm && (
          <form
            onSubmit={handleVideoSuggestionSubmit}
            className="mt-3 space-y-2 border-t border-indigo-100 pt-3 dark:border-gray-800"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Know a better tutorial for {skill.name}? Share the link so other learners can use it.
            </p>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              aria-label="Tutorial video URL"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              value={videoNote}
              onChange={(event) => setVideoNote(event.target.value)}
              placeholder="Optional note"
              aria-label="Suggestion note"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
            >
              Submit suggestion
            </button>
          </form>
        )}

        {videoSuggestions.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-indigo-100 pt-3 text-xs dark:border-gray-800">
            {videoSuggestions.map((suggestion, index) => (
              <li key={index}>
                <a
                  href={suggestion.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand hover:underline dark:text-brand-light"
                >
                  {suggestion.videoUrl}
                </a>
                {suggestion.note && (
                  <span className="ml-1 text-gray-500 dark:text-gray-400">— {suggestion.note}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Practical project
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Build a small project that demonstrates {skill.name}, push it to a public GitHub
          repository, and submit the link below. An admin will review it and credit this section
          once approved.
        </p>

        {practicalSubmission ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-900/20">
            <p className="text-emerald-700 dark:text-emerald-300">Submitted — pending admin review</p>
            <a
              href={practicalSubmission.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all font-medium text-brand hover:underline dark:text-brand-light"
            >
              {practicalSubmission.githubUrl}
            </a>
          </div>
        ) : (
          <form onSubmit={handlePracticalSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              required
              value={githubUrlInput}
              onChange={(event) => setGithubUrlInput(event.target.value)}
              placeholder="https://github.com/you/project"
              aria-label="GitHub repository URL"
              className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Submit for review
            </button>
          </form>
        )}
      </div>

      <CelebrationBurst triggerKey={celebrateKey} />

      {quiz && <SkillQuizSection quiz={quiz} skillName={skill.name} roleId={role.id} skillId={skill.id} />}
    </div>
  );
}
