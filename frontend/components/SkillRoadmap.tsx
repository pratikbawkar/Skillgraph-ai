import Link from 'next/link';
import type { Role, Skill, SkillProgress } from '@/lib/types';

interface SkillRoadmapProps {
  role: Role;
  progressBySkillId: Map<string, SkillProgress>;
}

const IMPORTANCE_RANK: Record<Skill['importance'], number> = {
  core: 0,
  important: 1,
  'nice-to-have': 2,
};

const DIFFICULTY_RANK: Record<Skill['difficulty'], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const ACCENTS = [
  'from-sky-400 to-blue-500',
  'from-fuchsia-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-indigo-400 to-violet-500',
  'from-lime-400 to-green-500',
];

function compareSkills(a: Skill, b: Skill): number {
  return (
    IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance] ||
    DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
    a.name.localeCompare(b.name)
  );
}

/**
 * Orders skills into a single skill-to-skill chain (prerequisite before
 * dependent) via Kahn's algorithm, so the roadmap always shows one skill
 * unlocking the next rather than disconnected, parallel skills.
 */
function buildSkillChain(skills: Skill[]): Skill[] {
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
  const inDegree = new Map<string, number>(skills.map((skill) => [skill.id, 0]));
  const dependents = new Map<string, string[]>(skills.map((skill) => [skill.id, []]));

  skills.forEach((skill) => {
    skill.prerequisites
      .filter((prereqId) => skillsById.has(prereqId))
      .forEach((prereqId) => {
        inDegree.set(skill.id, (inDegree.get(skill.id) ?? 0) + 1);
        dependents.get(prereqId)!.push(skill.id);
      });
  });

  const byId = (id: string) => skillsById.get(id)!;
  const compareIds = (a: string, b: string) => compareSkills(byId(a), byId(b));

  const ready = skills
    .map((skill) => skill.id)
    .filter((id) => inDegree.get(id) === 0)
    .sort(compareIds);

  const chain: Skill[] = [];
  while (ready.length > 0) {
    const currentId = ready.shift()!;
    chain.push(byId(currentId));

    const newlyReady: string[] = [];
    (dependents.get(currentId) ?? []).forEach((depId) => {
      const remaining = (inDegree.get(depId) ?? 0) - 1;
      inDegree.set(depId, remaining);
      if (remaining === 0) newlyReady.push(depId);
    });
    ready.push(...newlyReady);
    ready.sort(compareIds);
  }

  const chainIds = new Set(chain.map((skill) => skill.id));
  skills.forEach((skill) => {
    if (!chainIds.has(skill.id)) chain.push(skill); // cycle guard for malformed draft data
  });

  return chain;
}

function statusStyles(progress: SkillProgress | undefined) {
  const percentage = progress?.totalPercentage ?? 0;
  if (percentage >= 100) {
    return {
      ring: 'border-emerald-400 dark:border-emerald-500',
      dot: 'bg-emerald-500',
      label: 'Completed',
      badge: 'bg-emerald-500',
    };
  }
  if (percentage > 0) {
    return {
      ring: 'border-amber-400 dark:border-amber-500',
      dot: 'bg-amber-500',
      label: 'In progress',
      badge: 'bg-amber-500',
    };
  }
  return {
    ring: 'border-gray-300 dark:border-gray-700',
    dot: 'bg-gray-400 dark:bg-gray-600',
    label: 'Not started',
    badge: 'bg-indigo-400 dark:bg-gray-600',
  };
}

export function SkillRoadmap({ role, progressBySkillId }: SkillRoadmapProps) {
  const chain = buildSkillChain(role.skills);

  return (
    <div>
      <h2 className="mb-1 text-lg font-medium text-gray-900 dark:text-gray-100">Skill roadmap</h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        A winding path from your first skill to becoming a {role.name} — tap any stop to open its
        lesson, video, and quiz. Learn one skill at a time.
      </p>
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 sm:p-10">
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-indigo-200 via-purple-300 to-brand dark:from-gray-700 dark:via-gray-700 dark:to-brand-light sm:block hidden" />

        <ol className="relative flex flex-col gap-8">
          {chain.map((skill, index) => {
            const progress = progressBySkillId.get(skill.id);
            const styles = statusStyles(progress);
            const accent = ACCENTS[index % ACCENTS.length];
            const alignEnd = index % 2 === 1;

            return (
              <li key={skill.id} className="relative flex items-center">
                <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
                  <span
                    className={`flex h-10 w-10 rotate-3 items-center justify-center rounded-full border-4 border-white text-sm font-bold text-white shadow-lg dark:border-gray-950 ${styles.badge}`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className={`w-full sm:pr-0 ${alignEnd ? 'sm:pl-[52%]' : 'sm:pr-[52%]'}`}>
                  <Link
                    href={`/roles/${role.id}/skills/${skill.id}`}
                    className={`group block -rotate-1 rounded-2xl border-2 bg-white p-4 shadow-md transition hover:-translate-y-1 hover:rotate-0 hover:shadow-xl dark:bg-gray-900 ${styles.ring}`}
                  >
                    <div className="flex items-center gap-2 sm:hidden">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${styles.badge}`}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className={`mb-1 h-1.5 w-10 rounded-full bg-gradient-to-r ${accent}`} />
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
                      <span className="font-medium text-gray-900 group-hover:text-brand dark:text-gray-100 dark:group-hover:text-brand-light">
                        {skill.name}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                      {styles.label} · {progress?.totalPercentage ?? 0}% · tap to open lesson & quiz →
                    </p>
                  </Link>
                </div>
              </li>
            );
          })}

          <li className="relative flex items-center justify-center">
            <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-brand text-sm text-white shadow-lg dark:border-gray-950">
                ★
              </span>
            </div>
            <div className="w-full max-w-xs rounded-2xl border-2 border-brand bg-gradient-to-r from-brand via-indigo-500 to-brand-dark p-4 text-center shadow-lg dark:border-brand-light">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-100">You become a</p>
              <p className="text-base font-semibold text-white">{role.name}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
