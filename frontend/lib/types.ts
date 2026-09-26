export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type SkillImportance = 'core' | 'important' | 'nice-to-have';
export type SkillDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LearningResource {
  skillId: string;
  videoTitle: string;
  youtubeUrl: string;
  note?: string;
  curatedBy: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  importance: SkillImportance;
  difficulty: SkillDifficulty;
  prerequisites: string[];
  learningResource: LearningResource;
}

export interface SuggestedProject {
  id: string;
  title: string;
  description: string;
  relatedSkillIds: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  skills: Skill[];
  suggestedProjects: SuggestedProject[];
}

export type SkillSource = 'self-reported' | 'assessed';

export interface UserSkill {
  skillId: string;
  level: SkillLevel;
  source: SkillSource;
  assessmentId?: string;
}

export interface SkillGap {
  skillId: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  gap: number;
}

/**
 * Deterministic skill-progress model (plan.md MVP skill-progress model).
 * Weights are fixed and may only change via a documented ADR.
 */
export const SKILL_PROGRESS_WEIGHTS = {
  selfAssessment: 20,
  objectiveQuiz: 30,
  practicalProject: 30,
  evidenceSubmitted: 20,
} as const;

export interface SkillProgressBreakdown {
  selfAssessment: number;
  objectiveQuiz: number;
  practicalProject: number;
  evidenceSubmitted: number;
}

export interface SkillProgress {
  skillId: string;
  breakdown: SkillProgressBreakdown;
  totalPercentage: number;
}

export interface RoleProgress {
  roleId: string;
  overallPercentage: number;
  skillProgress: SkillProgress[];
}

export type RoadmapStepStatus = 'not-started' | 'in-progress' | 'completed';

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  relatedSkillIds: string[];
  suggestedProjectId?: string;
  status: RoadmapStepStatus;
}

export interface Roadmap {
  id: string;
  roleId: string;
  generatedAt: string;
  steps: RoadmapStep[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface SkillQuiz {
  skillId: string;
  questions: QuizQuestion[];
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  targetRoleId: string | null;
  weeklyAvailabilityHours: number;
}
