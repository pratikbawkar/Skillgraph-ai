import Link from 'next/link';
import type { SkillQuiz } from '@/lib/types';

interface SkillQuizSectionProps {
  quiz: SkillQuiz;
  skillName: string;
  roleId: string;
  skillId: string;
}

/** Intro card only — the actual quiz runs on its own page (see QuizPlayer). */
export function SkillQuizSection({ quiz, skillName, roleId, skillId }: SkillQuizSectionProps) {
  const totalQuestions = quiz.questions.length;

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4 text-center dark:border-gray-800 dark:bg-gray-800/60">
      <p className="font-medium text-gray-900 dark:text-gray-100">{skillName} quiz</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        This quiz has {totalQuestions} questions to test your understanding of {skillName}.
      </p>
      <Link
        href={`/roles/${roleId}/skills/${skillId}/quiz`}
        className="mt-3 inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Start quiz
      </Link>
    </div>
  );
}
