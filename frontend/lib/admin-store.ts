/**
 * Local-only mock admin auth + content overrides for this Phase 1 demo —
 * mirrors the mock auth in auth-context.tsx. Not real security (there is no
 * backend yet to enforce this, and NEXT_PUBLIC_ values are visible in the
 * built JS bundle) — treat it as a UI gate only, replaced by real
 * backend-verified admin auth in Phase 2. Credentials come from env vars
 * (see .env.example) so no credential is ever hardcoded in source.
 */

const ADMIN_SESSION_KEY = 'skillorbit.admin.session';
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export interface VideoOverride {
  videoTitle: string;
  youtubeUrl: string;
  note?: string;
}

function videoOverrideKey(skillId: string) {
  return `skillorbit.adminVideo.${skillId}`;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export function loginAdmin(username: string, password: string): boolean {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return false; // admin login is disabled until env vars are configured
  }
  const ok = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  if (ok) window.localStorage.setItem(ADMIN_SESSION_KEY, 'true');
  return ok;
}

export function logoutAdmin(): void {
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getVideoOverride(skillId: string): VideoOverride | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(videoOverrideKey(skillId));
    return raw ? (JSON.parse(raw) as VideoOverride) : undefined;
  } catch {
    return undefined;
  }
}

export function setVideoOverride(skillId: string, override: VideoOverride): void {
  window.localStorage.setItem(videoOverrideKey(skillId), JSON.stringify(override));
}
