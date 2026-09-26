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
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center overflow-hidden opacity-40 dark:opacity-25"
      >
        <div className="relative h-[95vmin] w-[95vmin] shrink-0">
          <div
            className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #fef08a, #f59e0b 60%, #b45309)',
              boxShadow: '0 0 40px 12px rgba(245, 158, 11, 0.55)',
            }}
          />
          <div className="absolute inset-0 rounded-full border border-dashed border-indigo-300 dark:border-indigo-800" />
          <div className="absolute inset-[12%] rounded-full border border-dashed border-indigo-300/80 dark:border-indigo-800/80" />
          <div className="absolute inset-[24%] rounded-full border border-dashed border-indigo-300/60 dark:border-indigo-800/60" />
          <div className="absolute inset-[36%] rounded-full border border-dashed border-indigo-300/40 dark:border-indigo-800/40" />
          <div className="orbit-ring absolute inset-0" style={{ animationDuration: '36s' }}>
            <span
              className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #93c5fd, #0284c7 70%)' }}
            />
          </div>
          <div
            className="orbit-ring absolute inset-[12%]"
            style={{ animationDuration: '27s', animationDirection: 'reverse' }}
          >
            <span
              className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #fde68a, #d97706 70%)' }}
            />
          </div>
          <div className="orbit-ring absolute inset-[24%]" style={{ animationDuration: '19s' }}>
            <span
              className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #6ee7b7, #059669 70%)' }}
            />
          </div>
          <div
            className="orbit-ring absolute inset-[36%]"
            style={{ animationDuration: '12s', animationDirection: 'reverse' }}
          >
            <span
              className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #fca5a5, #dc2626 70%)' }}
            />
          </div>
          {[
            { top: '10%', left: '15%', delay: '0s' },
            { top: '25%', left: '80%', delay: '0.6s' },
            { top: '65%', left: '8%', delay: '1.2s' },
            { top: '80%', left: '70%', delay: '0.3s' },
            { top: '45%', left: '92%', delay: '1.8s' },
          ].map((star, index) => (
            <span
              key={index}
              className="orbit-star absolute h-1 w-1 rounded-full bg-indigo-400 dark:bg-indigo-300"
              style={{ top: star.top, left: star.left, animationDelay: star.delay }}
            />
          ))}
        </div>
      </div>

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
