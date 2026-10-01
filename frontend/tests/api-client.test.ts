import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('api-client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('fetches roles using mock data', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'true');

    const { fetchRoles } = await import('../lib/api-client');

    const roles = await fetchRoles();

    expect(roles.length).toBeGreaterThan(0);
  });

  it('fetches a role using mock data', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'true');

    const { fetchRole } = await import('../lib/api-client');

    const role = await fetchRole('cloud-engineer');

    expect(role).toBeDefined();
  });

  it('fetches role progress using mock data', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'true');

    const { fetchRoleProgress } = await import('../lib/api-client');

    const progress = await fetchRoleProgress('cloud-engineer');

    expect(progress).toBeDefined();
  });

  it('logs in using mock data', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'true');

    const { login } = await import('../lib/api-client');

    const result = await login('test@example.com', 'password');

    expect(result.token).toBe('mock-token');
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.displayName).toBe('test');
  });

  it('registers using mock data', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'true');

    const { register } = await import('../lib/api-client');

    const result = await register(
      'test@example.com',
      'password',
      'Test User'
    );

    expect(result.token).toBe('mock-token');
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.displayName).toBe('Test User');
  });

  it('throws when API base URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'false');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');

    const { fetchRoles } = await import('../lib/api-client');

    await expect(fetchRoles()).rejects.toThrow(
      'NEXT_PUBLIC_API_BASE_URL is not configured'
    );
  });

  it('fetches roles from the real API', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'false');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 'cloud-engineer', name: 'Cloud Engineer' },
        ],
      })
    );

    const { fetchRoles } = await import('../lib/api-client');

    const roles = await fetchRoles();

    expect(roles).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/roles',
      undefined
    );
  });

  it('fetches a role from the real API', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'false');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'cloud-engineer',
          name: 'Cloud Engineer',
        }),
      })
    );

    const { fetchRole } = await import('../lib/api-client');

    const role = await fetchRole('cloud-engineer');

    expect(role?.id).toBe('cloud-engineer');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/roles/cloud-engineer',
      undefined
    );
  });

  it('fetches role progress from the real API', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'false');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          overallProgress: 50,
        }),
      })
    );

    const { fetchRoleProgress } = await import('../lib/api-client');

    const progress = await fetchRoleProgress('cloud-engineer');

    expect(progress.overallProgress).toBe(50);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/roles/cloud-engineer/progress',
      undefined
    );
  });

  it('logs in through the real API', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'false');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'real-token',
          user: {
            id: 'user-1',
            email: 'test@example.com',
          },
        }),
      })
    );

    const { login } = await import('../lib/api-client');

    const result = await login('test@example.com', 'password');

    expect(result.token).toBe('real-token');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password',
        }),
      }
    );
  });

  it('registers through the real API', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'false');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'real-token',
          user: {
            id: 'user-1',
            email: 'test@example.com',
            displayName: 'Test User',
          },
        }),
      })
    );

    const { register } = await import('../lib/api-client');

    const result = await register(
      'test@example.com',
      'password',
      'Test User'
    );

    expect(result.token).toBe('real-token');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/auth/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password',
          displayName: 'Test User',
        }),
      }
    );
  });

  it('throws when the real API returns an error', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCKS', 'false');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );

    const { fetchRoles } = await import('../lib/api-client');

    await expect(fetchRoles()).rejects.toThrow(
      'API request failed with status 500'
    );
  });
});