import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRole, fetchRoles } from '@/lib/api-client';
import { getQuizForSkill } from '@/lib/quiz-data';
import { QuizPlayer } from '@/components/QuizPlayer';

export async function generateStaticParams() {
  const roles = await fetchRoles();
  return roles.flatMap((role) =>
    role.skills.filter((skill) => getQuizForSkill(skill.id)).map((skill) => ({ roleId: role.id, skillId: skill.id }))
  );
}

interface QuizPageProps {
  params: Promise<{ roleId: string; skillId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { roleId, skillId } = await params;
  const role = await fetchRole(roleId);
  if (!role) {
    notFound();
  }
  const skill = role.skills.find((candidate) => candidate.id === skillId);
  const quiz = getQuizForSkill(skillId);
  if (!skill || !quiz) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/roles/${role.id}/skills/${skill.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-brand hover:underline dark:text-brand-light"
      >
        ← Back to {skill.name}
      </Link>
      <QuizPlayer roleId={role.id} skillId={skill.id} skillName={skill.name} quiz={quiz} />
    </div>
  );
}
