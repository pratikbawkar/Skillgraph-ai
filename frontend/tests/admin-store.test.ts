import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  changeAdminPassword,
  getVideoOverride,
  isAdminLoggedIn,
  loginAdmin,
  logoutAdmin,
  setVideoOverride,
} from '@/lib/admin-store';

function jwt(groups: string[]) {
  return `h.${btoa(JSON.stringify({ 'cognito:groups': groups }))}.s`;
}

function respond(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

const VIDEO = { videoTitle: 'T', youtubeUrl: 'https://y.t/1' };

describe('admin-store (production / Cognito mode)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com');
    vi.stubEnv('NEXT_PUBLIC_COGNITO_REGION', 'ap-south-1');
    vi.stubEnv('NEXT_PUBLIC_COGNITO_CLIENT_ID', 'client-id');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('stores the Cognito access token in sessionStorage on admin login and clears it on logout', async () => {
    fetchMock.mockReturnValueOnce(respond({ AuthenticationResult: { AccessToken: jwt(['admin']) } }));
    await expect(loginAdmin('a@b.com', 'pw')).resolves.toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://cognito-idp.ap-south-1.amazonaws.com/');
    expect(init.headers['X-Amz-Target']).toBe('AWSCognitoIdentityProviderService.InitiateAuth');
    expect(JSON.parse(init.body).AuthFlow).toBe('USER_PASSWORD_AUTH');
    expect(isAdminLoggedIn()).toBe(true);
    expect(window.localStorage.length).toBe(0);

    logoutAdmin();
    expect(isAdminLoggedIn()).toBe(false);
  });

  it('rejects non-admin accounts and Cognito failures', async () => {
    fetchMock.mockReturnValueOnce(respond({ AuthenticationResult: { AccessToken: jwt([]) } }));
    await expect(loginAdmin('a@b.com', 'pw')).rejects.toThrow(/not an administrator/);
    expect(isAdminLoggedIn()).toBe(false);

    fetchMock.mockReturnValueOnce(respond({ message: 'Incorrect username or password.' }, 400));
    await expect(loginAdmin('a@b.com', 'bad')).rejects.toThrow('Incorrect username or password.');

    fetchMock.mockReturnValueOnce(respond({ ChallengeName: 'NEW_PASSWORD_REQUIRED' }));
    await expect(loginAdmin('a@b.com', 'pw')).rejects.toThrow(/password challenge/);
  });

  it('changes the password through Cognito ChangePassword', async () => {
    window.sessionStorage.setItem('skillorbit.admin.accessToken', 'tok');
    fetchMock.mockReturnValueOnce(respond({}));
    await changeAdminPassword('old', 'new');
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['X-Amz-Target']).toBe('AWSCognitoIdentityProviderService.ChangePassword');
    expect(JSON.parse(init.body)).toEqual({
      AccessToken: 'tok',
      PreviousPassword: 'old',
      ProposedPassword: 'new',
    });
  });

  it('requires a session to change the password', async () => {
    await expect(changeAdminPassword('old', 'new')).rejects.toThrow(/signing in/);
  });

  it('fetches the persisted video override and falls back on 404 or network errors', async () => {
    fetchMock.mockReturnValueOnce(respond({ skillId: 's', ...VIDEO, note: '' }));
    await expect(getVideoOverride('s')).resolves.toEqual({ ...VIDEO, note: undefined });
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.com/content/skills/s/video');

    fetchMock.mockReturnValueOnce(respond({ detail: 'none' }, 404));
    await expect(getVideoOverride('s')).resolves.toBeUndefined();

    fetchMock.mockReturnValueOnce(Promise.reject(new Error('network')));
    await expect(getVideoOverride('s')).resolves.toBeUndefined();
  });

  it('saves the video override with the bearer token and surfaces failures', async () => {
    window.sessionStorage.setItem('skillorbit.admin.accessToken', 'tok');
    fetchMock.mockReturnValueOnce(respond({}));
    await setVideoOverride('s', VIDEO);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('PUT');
    expect(init.headers.Authorization).toBe('Bearer tok');

    fetchMock.mockReturnValueOnce(respond({}, 403));
    await expect(setVideoOverride('s', VIDEO)).rejects.toThrow(/not authorised/);
    fetchMock.mockReturnValueOnce(respond({}, 500));
    await expect(setVideoOverride('s', VIDEO)).rejects.toThrow(/Could not save/);
  });
});

describe('admin-store (local mock mode)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => vi.unstubAllEnvs());

  it('keeps the env-var gate and localStorage overrides', async () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_USERNAME', '');
    vi.stubEnv('NEXT_PUBLIC_ADMIN_PASSWORD', '');
    await expect(loginAdmin('admin', 'pw')).resolves.toBe(false);

    vi.stubEnv('NEXT_PUBLIC_ADMIN_USERNAME', 'admin');
    vi.stubEnv('NEXT_PUBLIC_ADMIN_PASSWORD', 'pw');
    await expect(loginAdmin('admin', 'wrong')).resolves.toBe(false);
    await expect(loginAdmin('admin', 'pw')).resolves.toBe(true);
    expect(isAdminLoggedIn()).toBe(true);
    logoutAdmin();
    expect(isAdminLoggedIn()).toBe(false);

    await setVideoOverride('s', VIDEO);
    await expect(getVideoOverride('s')).resolves.toEqual(VIDEO);
    await expect(changeAdminPassword('a', 'b')).rejects.toThrow();
  });
});
