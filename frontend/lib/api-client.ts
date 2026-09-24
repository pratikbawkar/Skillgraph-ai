/**
 * All dynamic data flows through this client so pages never call
 * fetch() directly (plan.md: dynamic functionality lives behind the API,
 * frontend stays a portable static export).
 *
 * NEXT_PUBLIC_USE_MOCKS=true (default) serves local fixtures so the UI is
 * demoable while the FastAPI backend is built in parallel — Phase 1 rule:
 * mock backend/AWS-backed calls rather than depending on real services.
 */
import { ROLES, getRoleById, getMockRoleProgress } from './mock-data';
import type { EvidenceEvaluation, Role, RoleProgress, UserProfile } from './types';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export async function fetchRoles(): Promise<Role[]> {
  if (USE_MOCKS) return ROLES;
  return apiFetch<Role[]>('/roles');
}

export async function fetchRole(roleId: string): Promise<Role | undefined> {
  if (USE_MOCKS) return getRoleById(roleId);
  return apiFetch<Role>(`/roles/${roleId}`);
}

export async function fetchRoleProgress(roleId: string): Promise<RoleProgress> {
  if (USE_MOCKS) return getMockRoleProgress(roleId);
  return apiFetch<RoleProgress>(`/roles/${roleId}/progress`);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCKS) {
    return {
      token: 'mock-token',
      user: {
        id: 'mock-user',
        email,
        displayName: email.split('@')[0] || 'Learner',
        targetRoleId: null,
        weeklyAvailabilityHours: 5,
      },
    };
  }
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResponse> {
  if (USE_MOCKS) {
    return {
      token: 'mock-token',
      user: {
        id: 'mock-user',
        email,
        displayName,
        targetRoleId: null,
        weeklyAvailabilityHours: 5,
      },
    };
  }
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  });
}

export async function submitEvidence(input: {
  skillId: string;
  description: string;
  links: string[];
}): Promise<EvidenceEvaluation> {
  if (USE_MOCKS) {
    return {
      submissionId: `mock-evidence-${Date.now()}`,
      findings: {
        summary: 'Mock evaluation: evidence recorded locally, no backend evaluation available.',
        relevantSkillIds: [input.skillId],
        matchedCriteria: [],
        missingCriteria: [],
        confidence: 'low',
      },
      evaluatedAt: new Date().toISOString(),
    };
  }
  return apiFetch<EvidenceEvaluation>('/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
