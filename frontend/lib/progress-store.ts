import { SKILL_PROGRESS_WEIGHTS, type SkillProgress } from './types';

/**
 * Local-only completion + quiz interactions layered on top of the
 * deterministic backend progress (plan.md MVP skill-progress model is never
 * computed by the frontend) so the UI can react immediately in this
 * mock-data phase, before these signals are backend-driven.
 */

export interface QuizResult {
  correctCount: number;
  totalQuestions: number;
}

export interface PracticalSubmission {
  githubUrl: string;
  submittedAt: string;
}

function completedStorageKey(roleId: string) {
  return `skillorbit.completed.${roleId}`;
}

function quizStorageKey(roleId: string, skillId: string) {
  return `skillorbit.quiz.${roleId}.${skillId}`;
}

function practicalStorageKey(roleId: string, skillId: string) {
  return `skillorbit.practical.${roleId}.${skillId}`;
}

function videoWatchedStorageKey(roleId: string, skillId: string) {
  return `skillorbit.videoWatched.${roleId}.${skillId}`;
}

export function getCompletedSkillIds(roleId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(completedStorageKey(roleId));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function setSkillCompletion(roleId: string, skillId: string, completed: boolean): Set<string> {
  const next = getCompletedSkillIds(roleId);
  if (completed) {
    next.add(skillId);
  } else {
    next.delete(skillId);
  }
  window.localStorage.setItem(completedStorageKey(roleId), JSON.stringify(Array.from(next)));
  return next;
}

export function getQuizResult(roleId: string, skillId: string): QuizResult | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(quizStorageKey(roleId, skillId));
    return raw ? (JSON.parse(raw) as QuizResult) : undefined;
  } catch {
    return undefined;
  }
}

export function setQuizResult(roleId: string, skillId: string, result: QuizResult): void {
  window.localStorage.setItem(quizStorageKey(roleId, skillId), JSON.stringify(result));
}

export function getPracticalSubmission(roleId: string, skillId: string): PracticalSubmission | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(practicalStorageKey(roleId, skillId));
    return raw ? (JSON.parse(raw) as PracticalSubmission) : undefined;
  } catch {
    return undefined;
  }
}

export function setPracticalSubmission(roleId: string, skillId: string, githubUrl: string): PracticalSubmission {
  const submission: PracticalSubmission = { githubUrl, submittedAt: new Date().toISOString() };
  window.localStorage.setItem(practicalStorageKey(roleId, skillId), JSON.stringify(submission));
  return submission;
}

export function getVideoWatched(roleId: string, skillId: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(videoWatchedStorageKey(roleId, skillId)) === 'true';
}

export function setVideoWatched(roleId: string, skillId: string, watched: boolean): void {
  window.localStorage.setItem(videoWatchedStorageKey(roleId, skillId), String(watched));
}

/**
 * Marking a skill complete always shows 100%. Otherwise: watching the
 * recommended video credits the "recommended video" portion (stored under
 * the selfAssessment field), a submitted quiz score is layered onto the
 * objective-quiz portion, and a submitted GitHub link credits the full
 * practical-project portion (pending admin review) — so the progress bar
 * reacts the moment any of these is submitted.
 */
export function computeEffectiveProgress(
  baseProgress: SkillProgress,
  completed: boolean,
  quizResult: QuizResult | undefined,
  practicalSubmission?: PracticalSubmission,
  videoWatched?: boolean
): SkillProgress {
  if (completed) {
    return { ...baseProgress, totalPercentage: 100 };
  }

  if ((!quizResult || quizResult.totalQuestions === 0) && !practicalSubmission && !videoWatched) {
    return baseProgress;
  }

  const breakdown = { ...baseProgress.breakdown };
  if (videoWatched) {
    breakdown.selfAssessment = SKILL_PROGRESS_WEIGHTS.selfAssessment;
  }
  if (quizResult && quizResult.totalQuestions > 0) {
    breakdown.objectiveQuiz = Math.round(
      (quizResult.correctCount / quizResult.totalQuestions) * SKILL_PROGRESS_WEIGHTS.objectiveQuiz
    );
  }
  if (practicalSubmission) {
    breakdown.practicalProject = SKILL_PROGRESS_WEIGHTS.practicalProject;
  }
  const totalPercentage = Math.min(
    100,
    breakdown.selfAssessment + breakdown.objectiveQuiz + breakdown.practicalProject + breakdown.evidenceSubmitted
  );
  return { ...baseProgress, breakdown, totalPercentage };
}
