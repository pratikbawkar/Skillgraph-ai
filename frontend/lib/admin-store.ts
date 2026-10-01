/**
 * Admin auth + recommended-video overrides.
 *
 * Production (NEXT_PUBLIC_API_BASE_URL set): admins sign in with Amazon
 * Cognito (USER_PASSWORD_AUTH on the public web app client), the access token
 * lives in sessionStorage, and video overrides are read from / written to the
 * backend, which only accepts members of the Cognito "admin" group.
 *
 * Local mock mode (no API base URL): the original UI-only gate using
 * NEXT_PUBLIC_ADMIN_USERNAME / NEXT_PUBLIC_ADMIN_PASSWORD (see .env.example)
 * and localStorage. Not real security; never configure those in production.
 */

const ADMIN_SESSION_KEY = 'skillorbit.admin.session';
const ADMIN_TOKEN_KEY = 'skillorbit.admin.accessToken';

export interface VideoOverride {
  videoTitle: string;
  youtubeUrl: string;
  note?: string;
}

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
}

function videoOverrideKey(skillId: string) {
  return `skillorbit.adminVideo.${skillId}`;
}

function videoUrl(skillId: string) {
  return `${apiBaseUrl()}/content/skills/${encodeURIComponent(skillId)}/video`;
}

async function cognitoRequest(target: string, body: Record<string, unknown>) {
  const region = process.env.NEXT_PUBLIC_COGNITO_REGION;
  if (!region || !process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID) {
    throw new Error('Admin login is not configured.');
  }
  const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown> & { AuthenticationResult?: { AccessToken?: string } };
  if (!response.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : 'Request failed.');
  }
  return data;
}

function tokenIsAdmin(token: string): boolean {
  // UI hint only; the backend independently enforces the admin group.
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Array.isArray(payload['cognito:groups']) && payload['cognito:groups'].includes('admin');
  } catch {
    return false;
  }
}

export function getAdminAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  if (apiBaseUrl()) return getAdminAccessToken() !== null;
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  if (apiBaseUrl()) {
    const data = await cognitoRequest('InitiateAuth', {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      AuthParameters: { USERNAME: username, PASSWORD: password },
    });
    const token = data.AuthenticationResult?.AccessToken;
    if (!token) {
      throw new Error('This account must complete a password challenge before signing in.');
    }
    if (!tokenIsAdmin(token)) {
      throw new Error('This account is not an administrator.');
    }
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    return true;
  }
  const expectedUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) {
    return false; // local admin login is disabled until env vars are configured
  }
  const ok = username === expectedUsername && password === expectedPassword;
  if (ok) window.localStorage.setItem(ADMIN_SESSION_KEY, 'true');
  return ok;
}

export function logoutAdmin(): void {
  window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function changeAdminPassword(oldPassword: string, newPassword: string): Promise<void> {
  const token = getAdminAccessToken();
  if (!apiBaseUrl() || !token) {
    throw new Error('Password changes require signing in with a production admin account.');
  }
  await cognitoRequest('ChangePassword', {
    AccessToken: token,
    PreviousPassword: oldPassword,
    ProposedPassword: newPassword,
  });
}

export async function getVideoOverride(skillId: string): Promise<VideoOverride | undefined> {
  if (apiBaseUrl()) {
    try {
      const response = await fetch(videoUrl(skillId));
      if (!response.ok) return undefined; // 404 -> curated default resource
      const data = (await response.json()) as VideoOverride;
      return { videoTitle: data.videoTitle, youtubeUrl: data.youtubeUrl, note: data.note || undefined };
    } catch {
      return undefined;
    }
  }
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(videoOverrideKey(skillId));
    return raw ? (JSON.parse(raw) as VideoOverride) : undefined;
  } catch {
    return undefined;
  }
}

export async function setVideoOverride(skillId: string, override: VideoOverride): Promise<void> {
  if (apiBaseUrl()) {
    const token = getAdminAccessToken();
    const response = await fetch(videoUrl(skillId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify(override),
    });
    if (!response.ok) {
      throw new Error(
        response.status === 401 || response.status === 403
          ? 'Your admin session has expired or is not authorised. Please log in again.'
          : 'Could not save the video.'
      );
    }
    return;
  }
  window.localStorage.setItem(videoOverrideKey(skillId), JSON.stringify(override));
}
