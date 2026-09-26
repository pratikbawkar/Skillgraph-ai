import { notFound } from 'next/navigation';
import { fetchRole, fetchRoleProgress, fetchRoles } from '@/lib/api-client';
import { RoleSkillsBoard } from '@/components/RoleSkillsBoard';
import { SuggestedProjectCard } from '@/components/SuggestedProjectCard';

export async function generateStaticParams() {
  const roles = await fetchRoles();
  return roles.map((role) => ({ roleId: role.id }));
}

interface RolePageProps {
  params: Promise<{ roleId: string }>;
}

export default async function RolePage({ params }: RolePageProps) {
  const { roleId } = await params;
  const role = await fetchRole(roleId);
  if (!role) {
    notFound();
  }
  const progress = await fetchRoleProgress(roleId);
  const progressBySkillId = new Map(
    progress.skillProgress.map((skillProgress) => [skillProgress.skillId, skillProgress])
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{role.name}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{role.description}</p>
      </div>

      <RoleSkillsBoard role={role} progressBySkillId={progressBySkillId} />

      {role.suggestedProjects.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
            Suggested projects
          </h2>
          <ul className="space-y-2">
            {role.suggestedProjects.map((project) => (
              <SuggestedProjectCard key={project.id} project={project} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
