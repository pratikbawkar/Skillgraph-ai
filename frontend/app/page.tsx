import Link from 'next/link';
import { fetchRoles } from '@/lib/api-client';

const ROLE_ACCENTS: Record<string, string> = {
  'cloud-engineer': 'from-sky-500 to-sky-600',
  'devops-engineer': 'from-amber-500 to-amber-600',
  'python-developer': 'from-emerald-500 to-emerald-600',
};

export default async function HomePage() {
  const roles = await fetchRoles();

  return (
    <div>
      <section className="mb-10 rounded-2xl bg-gradient-to-r from-brand via-indigo-500 to-role-python p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Turn skill gaps into a project-based learning roadmap
        </h1>
        <p className="mt-3 max-w-2xl text-indigo-50">
          Assess your skills for a target role, see exactly where the gaps are,
          and follow a roadmap of real projects with measurable evidence of
          progress.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Choose a target role
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Link
              key={role.id}
              href={`/roles/${role.id}`}
              className="group overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${ROLE_ACCENTS[role.id] ?? 'from-brand to-brand-dark'}`}
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {role.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {role.description}
                </p>
                <p className="mt-3 text-xs font-medium text-brand group-hover:underline dark:text-brand-light">
                  {role.skills.length} skills · View skill graph →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
