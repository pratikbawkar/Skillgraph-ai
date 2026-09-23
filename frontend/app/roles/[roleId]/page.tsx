import { notFound } from 'next/navigation';
import { fetchRole, fetchRoleProgress, fetchRoles } from '@/lib/api-client';
import { SkillCard } from '@/components/SkillCard';
import { ProgressBar } from '@/components/ProgressBar';

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
        <h1 className="text-2xl font-semibold text-gray-900">{role.name}</h1>
        <p className="mt-1 text-gray-600">{role.description}</p>
        <div className="mt-4 max-w-sm">
          <ProgressBar
            percentage={progress.overallPercentage}
            label="Overall role progress"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {role.skills.map((skill) => {
          const skillProgress = progressBySkillId.get(skill.id);
          if (!skillProgress) return null;
          return <SkillCard key={skill.id} skill={skill} progress={skillProgress} />;
        })}
      </div>

      {role.suggestedProjects.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-medium text-gray-900">
            Suggested projects
          </h2>
          <ul className="space-y-2">
            {role.suggestedProjects.map((project) => (
              <li
                key={project.id}
                className="rounded border border-gray-200 bg-white p-3"
              >
                <p className="font-medium text-gray-900">{project.title}</p>
                <p className="text-sm text-gray-600">{project.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
