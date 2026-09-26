import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRole, fetchRoleProgress, fetchRoles } from '@/lib/api-client';
import { getQuizForSkill } from '@/lib/quiz-data';
import { SkillDetailBoard } from '@/components/SkillDetailBoard';

export async function generateStaticParams() {
  const roles = await fetchRoles();
  return roles.flatMap((role) =>
    role.skills.map((skill) => ({ roleId: role.id, skillId: skill.id }))
  );
}

interface SkillPageProps {
  params: Promise<{ roleId: string; skillId: string }>;
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { roleId, skillId } = await params;
  const role = await fetchRole(roleId);
  if (!role) {
    notFound();
  }
  const skill = role.skills.find((candidate) => candidate.id === skillId);
  if (!skill) {
    notFound();
  }

  const roleProgress = await fetchRoleProgress(roleId);
  const skillProgress = roleProgress.skillProgress.find((sp) => sp.skillId === skillId) ?? {
    skillId,
    breakdown: { selfAssessment: 0, objectiveQuiz: 0, practicalProject: 0, evidenceSubmitted: 0 },
    totalPercentage: 0,
  };
  const quiz = getQuizForSkill(skillId);

  return (
    <div>
      <Link
        href={`/roles/${role.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-brand hover:underline dark:text-brand-light"
      >
        ← Back to {role.name} roadmap
      </Link>
      <SkillDetailBoard role={role} skill={skill} progress={skillProgress} quiz={quiz} />
    </div>
  );
}
