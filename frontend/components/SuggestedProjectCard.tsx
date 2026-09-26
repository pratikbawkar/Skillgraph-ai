'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { SuggestedProject } from '@/lib/types';

interface SuggestedProjectCardProps {
  project: SuggestedProject;
}

interface VideoSuggestion {
  videoUrl: string;
  note: string;
}

function storageKey(projectId: string) {
  return `skillorbit.videoSuggestions.${projectId}`;
}

export function SuggestedProjectCard({ project }: SuggestedProjectCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [note, setNote] = useState('');
  const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(project.id));
      setSuggestions(raw ? (JSON.parse(raw) as VideoSuggestion[]) : []);
    } catch {
      setSuggestions([]);
    }
  }, [project.id]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!videoUrl.trim()) return;
    const next = [...suggestions, { videoUrl: videoUrl.trim(), note: note.trim() }];
    setSuggestions(next);
    window.localStorage.setItem(storageKey(project.id), JSON.stringify(next));
    setVideoUrl('');
    setNote('');
  }

  return (
    <li className="rounded-lg border border-indigo-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{project.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          aria-label={`Suggest a tutorial video for ${project.title}`}
          aria-expanded={showForm}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-200 text-xs font-semibold text-brand hover:bg-indigo-50 dark:border-gray-700 dark:text-brand-light dark:hover:bg-gray-800"
        >
          i
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 space-y-2 border-t border-indigo-100 pt-3 dark:border-gray-800"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Know a good tutorial for this project? Share the link so other learners can use it.
          </p>
          <input
            type="url"
            required
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            aria-label="Tutorial video URL"
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note"
            aria-label="Suggestion note"
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
          >
            Submit suggestion
          </button>
        </form>
      )}

      {suggestions.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-indigo-100 pt-3 text-xs dark:border-gray-800">
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              <a
                href={suggestion.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline dark:text-brand-light"
              >
                {suggestion.videoUrl}
              </a>
              {suggestion.note && (
                <span className="ml-1 text-gray-500 dark:text-gray-400">— {suggestion.note}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
