import Link from 'next/link';
import { fetchRoles } from '@/lib/api-client';

export default async function HomePage() {
  const roles = await fetchRoles();

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900">
          Turn skill gaps into a project-based learning roadmap
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Assess your skills for a target role, see exactly where the gaps are,
          and follow a roadmap of real projects with measurable evidence of
          progress.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-gray-900">
          Choose a target role
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Link
              key={role.id}
              href={`/roles/${role.id}`}
              className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand hover:shadow-sm"
            >
              <h3 className="font-medium text-gray-900">{role.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{role.description}</p>
              <p className="mt-3 text-xs text-gray-400">
                {role.skills.length} skills
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
