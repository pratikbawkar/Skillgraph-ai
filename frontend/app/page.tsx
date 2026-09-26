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
          <div className="absolute inset-[9%] rounded-full border border-dashed border-indigo-300/85 dark:border-indigo-800/85" />
          <div className="absolute inset-[18%] rounded-full border border-dashed border-indigo-300/70 dark:border-indigo-800/70" />
          <div className="absolute inset-[27%] rounded-full border border-dashed border-indigo-300/55 dark:border-indigo-800/55" />
          <div className="absolute inset-[36%] rounded-full border border-dashed border-indigo-300/40 dark:border-indigo-800/40" />
          <div className="absolute inset-[45%] rounded-full border border-dashed border-indigo-300/25 dark:border-indigo-800/25" />
          <div className="orbit-ring absolute inset-0" style={{ animationDuration: '18s' }}>
            <span
              className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #93c5fd, #0284c7 70%)' }}
            />
          </div>
          <div
            className="orbit-ring absolute inset-[9%]"
            style={{ animationDuration: '14s', animationDirection: 'reverse' }}
          >
            <span
              className="absolute left-1/2 top-0 h-4.5 w-4.5 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #d8b4fe, #7e22ce 70%)' }}
            />
          </div>
          <div className="orbit-ring absolute inset-[18%]" style={{ animationDuration: '11s' }}>
            <span
              className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #fde68a, #d97706 70%)' }}
            />
          </div>
          <div
            className="orbit-ring absolute inset-[27%]"
            style={{ animationDuration: '9s', animationDirection: 'reverse' }}
          >
            <span
              className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #6ee7b7, #059669 70%)' }}
            />
          </div>
          <div className="orbit-ring absolute inset-[36%]" style={{ animationDuration: '7s' }}>
            <span
              className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #fca5a5, #dc2626 70%)' }}
            />
          </div>
          <div
            className="orbit-ring absolute inset-[45%]"
            style={{ animationDuration: '5s', animationDirection: 'reverse' }}
          >
            <span
              className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full shadow"
              style={{ background: 'radial-gradient(circle at 35% 35%, #f9a8d4, #db2777 70%)' }}
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
