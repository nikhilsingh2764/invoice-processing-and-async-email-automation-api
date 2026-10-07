import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../src/api/client';

/** Fake network: `routes[path]` is a queue of responses ({status, data}) consumed in order. */
function makeClient(routes, onAuthFailure = vi.fn()) {
  const calls = [];
  const client = createApiClient('http://api.test/api/v1', onAuthFailure);
  client.defaults.adapter = async (config) => {
    calls.push(`${config.method.toUpperCase()} ${config.url}`);
    const queue = routes[config.url];
    const res = queue.length > 1 ? queue.shift() : queue[0];
    const response = { status: res.status, data: res.data ?? {}, headers: {}, config, request: {} };
    if (res.status >= 200 && res.status < 300) return response;
    const err = new Error(`HTTP ${res.status}`);
    err.isAxiosError = true; err.config = config; err.response = response;
    throw err;
  };
  return { client, calls, onAuthFailure };
}

describe('auth refresh behaviour', () => {
  it('refreshes once on 401 then retries the original request', async () => {
    const { client, calls } = makeClient({
      '/profile': [{ status: 401 }, { status: 200, data: { ok: 1 } }],
      '/refresh-token': [{ status: 200 }],
    });
    const res = await client.get('/profile');
    expect(res.data).toEqual({ ok: 1 });
    expect(calls).toEqual(['GET /profile', 'POST /refresh-token', 'GET /profile']);
  });

  it('shares ONE refresh between concurrent 401s', async () => {
    const { client, calls } = makeClient({
      '/a': [{ status: 401 }, { status: 200 }],
      '/b': [{ status: 401 }, { status: 200 }],
      '/c': [{ status: 401 }, { status: 200 }],
      '/refresh-token': [{ status: 200 }],
    });
    await Promise.all([client.get('/a'), client.get('/b'), client.get('/c')]);
    expect(calls.filter((c) => c === 'POST /refresh-token')).toHaveLength(1);
  });

  it('signs out (once per failure) when refresh is rejected, without looping', async () => {
    const { client, calls, onAuthFailure } = makeClient({
      '/profile': [{ status: 401 }],
      '/refresh-token': [{ status: 401 }],
    });
    await expect(client.get('/profile')).rejects.toMatchObject({ response: { status: 401 } });
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['GET /profile', 'POST /refresh-token']);
  });

  it('does not retry a request twice if the retry also returns 401', async () => {
    const { client, calls } = makeClient({
      '/profile': [{ status: 401 }],
      '/refresh-token': [{ status: 200 }],
    });
    await expect(client.get('/profile')).rejects.toMatchObject({ response: { status: 401 } });
    expect(calls).toEqual(['GET /profile', 'POST /refresh-token', 'GET /profile']);
  });

  it('keeps the user signed in when refresh fails with 429 / 500', async () => {
    for (const status of [429, 500]) {
      const { client, onAuthFailure } = makeClient({
        '/profile': [{ status: 401 }],
        '/refresh-token': [{ status }],
      });
      await expect(client.get('/profile')).rejects.toMatchObject({ response: { status } });
      expect(onAuthFailure).not.toHaveBeenCalled();
    }
  });

  it('never tries to refresh for login / refresh-token 401s', async () => {
    const { client, calls } = makeClient({ '/login': [{ status: 401 }], '/refresh-token': [{ status: 401 }] });
    await expect(client.post('/login')).rejects.toBeTruthy();
    expect(calls).toEqual(['POST /login']);
  });

  it('does not refresh for non-401 errors', async () => {
    const { client, calls } = makeClient({ '/x': [{ status: 403 }] });
    await expect(client.get('/x')).rejects.toBeTruthy();
    expect(calls).toEqual(['GET /x']);
  });
});
