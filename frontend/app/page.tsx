import Link from 'next/link';
import { fetchRoles } from '@/lib/api-client';

const ROLE_ACCENTS: Record<string, string> = {
  'cloud-engineer': 'from-sky-500 to-sky-600',
  'devops-engineer': 'from-amber-500 to-amber-600',
  'python-developer': 'from-emerald-500 to-emerald-600',
};

const ROLE_ICONS: Record<string, string> = {
  'cloud-engineer': '☁️',
  'devops-engineer': '🛠️',
  'python-developer': '🐍',
};

export default async function HomePage() {
  const roles = await fetchRoles();

  return (
    <div>
      <section className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-indigo-500 to-role-python p-8 text-white shadow-lg sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold">
            Turn skill gaps into a project-based learning roadmap
          </h1>
          <p className="mt-3 text-indigo-50">
            Assess your skills for a target role, see exactly where the gaps are,
            and follow a roadmap of real projects with measurable evidence of
            progress.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-8 -top-8 hidden h-56 w-56 sm:block">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/30" />
          <div className="absolute inset-8 rounded-full border border-dashed border-white/25" />
          <div className="absolute inset-16 rounded-full border border-dashed border-white/20" />
          <div className="orbit-ring absolute inset-0" style={{ animationDuration: '9s' }}>
            <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-role-cloud shadow" />
          </div>
          <div
            className="orbit-ring absolute inset-8"
            style={{ animationDuration: '13s', animationDirection: 'reverse' }}
          >
            <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-role-devops shadow" />
          </div>
          <div className="orbit-ring absolute inset-16" style={{ animationDuration: '7s' }}>
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-role-python shadow" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🪐</div>
        </div>
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
              className="group overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm transition hover:-translate-y-1 hover:rotate-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${ROLE_ACCENTS[role.id] ?? 'from-brand to-brand-dark'}`}
              />
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-lg dark:bg-gray-800">
                    {ROLE_ICONS[role.id] ?? '🧭'}
                  </span>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{role.name}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                <p className="mt-3 text-xs font-medium text-brand group-hover:underline dark:text-brand-light">
                  {role.skills.length} skills · View skill roadmap →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
