'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { fetchRoles, submitEvidence } from '@/lib/api-client';
import type { EvidenceEvaluation, Role } from '@/lib/types';

export default function EvidencePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [skillId, setSkillId] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvidenceEvaluation | null>(null);

  useEffect(() => {
    fetchRoles()
      .then(setRoles)
      .finally(() => setIsLoadingRoles(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEvaluation(null);

    if (!skillId) {
      setError('Please select a skill.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe what you built or learned.');
      return;
    }

    setIsSubmitting(true);
    try {
      const linkList = links
        .split('\n')
        .map((link) => link.trim())
        .filter(Boolean);
      const result = await submitEvidence({ skillId, description, links: linkList });
      setEvaluation(result);
      setDescription('');
      setLinks('');
    } catch {
      setError('Unable to submit evidence right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Submit evidence</h1>
      <p className="mb-6 text-sm text-gray-600">
        Describe what you built or learned, and optionally link to a GitHub
        repository, portfolio, or deployed application. AI will summarize your
        evidence and highlight what is missing — it will not make an
        automatic pass/fail decision.
      </p>

      {isLoadingRoles ? (
        <p className="text-sm text-gray-500">Loading skills…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="skillId" className="block text-sm font-medium text-gray-700">
              Skill
            </label>
            <select
              id="skillId"
              value={skillId}
              onChange={(event) => setSkillId(event.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select a skill…</option>
              {roles.map((role) => (
                <optgroup key={role.id} label={role.name}>
                  {role.skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              What did you build or learn?
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="links" className="block text-sm font-medium text-gray-700">
              Links (optional, one per line)
            </label>
            <textarea
              id="links"
              value={links}
              onChange={(event) => setLinks(event.target.value)}
              rows={3}
              placeholder="https://github.com/you/project"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting…' : 'Submit evidence'}
          </button>
        </form>
      )}

      {evaluation && (
        <div role="status" className="mt-6 rounded border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-medium text-gray-900">AI findings</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              Confidence: {evaluation.findings.confidence}
            </span>
          </div>
          <p className="text-sm text-gray-700">{evaluation.findings.summary}</p>

          {evaluation.findings.matchedCriteria.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500">Matched</p>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                {evaluation.findings.matchedCriteria.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.findings.missingCriteria.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500">Missing</p>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                {evaluation.findings.missingCriteria.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-400">
            This is a summary, not a pass/fail decision.
          </p>
        </div>
      )}
    </div>
  );
}
