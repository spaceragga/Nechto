import { ApiClient, ApiError } from './client';

describe('ApiClient', () => {
  const fetchMock = jest.fn<
    Promise<Response>,
    [RequestInfo | URL, RequestInit?]
  >();

  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('posts JSON register payloads with credentials', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ user: { id: '1', email: 'a@nechto.test' } }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001/',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(
      client.register({ email: 'a@nechto.test', password: 'password123' }),
    ).resolves.toEqual({
      user: { id: '1', email: 'a@nechto.test' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/register',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          email: 'a@nechto.test',
          password: 'password123',
        }),
      }),
    );
  });

  it('uploads avatar as multipart without forcing JSON content-type', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'p1',
          userId: 'u1',
          email: 'a@nechto.test',
          displayName: null,
          bio: null,
          avatarUrl: 'http://localhost:3001/uploads/a.png',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await client.uploadMyAvatar(
      new Blob(['png'], { type: 'image/png' }),
      'a.png',
    );

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBeInstanceOf(FormData);
    expect(new Headers(init?.headers).get('Content-Type')).toBeNull();
  });

  it('throws ApiError on non-OK responses', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(
      client.login({ email: 'a@nechto.test', password: 'bad' }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Invalid email or password',
    } satisfies Partial<ApiError>);
  });

  it('uses a bound global fetch by default without Illegal invocation', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ status: 'ok', service: 'api', database: 'up' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = new ApiClient({ baseUrl: 'http://localhost:3001' });
    await expect(client.getHealth()).resolves.toMatchObject({ status: 'ok' });
    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
