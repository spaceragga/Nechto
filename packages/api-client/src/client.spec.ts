import { ApiClient, ApiError } from './client';
import { API_ERROR_CODES } from '@nechto/api-contract';

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
          slug: null,
          directions: [],
          websiteUrl: null,
          instagramUrl: null,
          telegramUrl: null,
          publishedAt: null,
          workCount: 0,
          acceptPolicies: false,
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

  it('uploads a work as multipart with a title field', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'w1',
          title: 'Yard',
          description: 'Wet asphalt after rain.',
          imageUrl: 'http://localhost:3001/uploads/works/a.png',
          createdAt: '2026-08-31T00:00:00.000Z',
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

    await client.uploadMyWork(
      new Blob(['png'], { type: 'image/png' }),
      { title: 'Yard', description: 'Wet asphalt after rain.' },
      'a.png',
    );

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBeInstanceOf(FormData);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:3001/works');
  });

  it('patches work copy as JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'w1',
          title: 'Yard, evening',
          description: 'Updated note.',
          imageUrl: 'http://localhost:3001/uploads/works/a.png',
          createdAt: '2026-08-31T00:00:00.000Z',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await client.updateMyWork('w1', {
      title: 'Yard, evening',
      description: 'Updated note.',
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:3001/works/w1');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({
        title: 'Yard, evening',
        description: 'Updated note.',
      }),
    });
  });

  it('loads a published work by id', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'w1',
          title: 'Yard',
          description: 'Wet asphalt after rain.',
          imageUrl: 'http://localhost:3001/uploads/works/a.png',
          createdAt: '2026-08-31T00:00:00.000Z',
          author: {
            slug: 'kasia-voit',
            displayName: 'Кася Войт',
            avatarUrl: null,
            directions: ['photography'],
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.getWork('w1')).resolves.toMatchObject({
      id: 'w1',
      author: { slug: 'kasia-voit', directions: ['photography'] },
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:3001/works/w1');
  });

  it('lists published works filtered by direction', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ items: [], nextCursor: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await client.listPublishedWorks({ direction: 'photography', limit: 12 });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://localhost:3001/works?limit=12&direction=photography',
    );
  });

  it('throws SERVICE_UNAVAILABLE when fetch cannot reach the API', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(
      client.login({ email: 'a@nechto.test', password: 'password123' }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 503,
      code: API_ERROR_CODES.SERVICE_UNAVAILABLE,
    } satisfies Partial<ApiError>);
  });

  it('throws SERVICE_UNAVAILABLE on a non-JSON 502 from the proxy', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>bad gateway</html>', { status: 502 }),
    );

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(
      client.login({ email: 'a@nechto.test', password: 'password123' }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 502,
      code: API_ERROR_CODES.SERVICE_UNAVAILABLE,
    } satisfies Partial<ApiError>);
  });

  it('throws ApiError on non-OK responses', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          code: API_ERROR_CODES.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
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
      code: API_ERROR_CODES.INVALID_CREDENTIALS,
      message: 'Invalid email or password',
    } satisfies Partial<ApiError>);
  });

  it('merges default headers for server-side cookie forwarding', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ user: { id: '1', email: 'a@nechto.test' } }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const client = new ApiClient({
      baseUrl: 'http://api:3001',
      fetch: fetchMock as unknown as typeof fetch,
      credentials: 'omit',
      headers: { Cookie: 'nechto_access_token=tok' },
      cache: 'no-store',
    });

    await client.me();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api:3001/auth/me',
      expect.objectContaining({
        credentials: 'omit',
        cache: 'no-store',
      }),
    );
    expect(
      new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Cookie'),
    ).toBe('nechto_access_token=tok');
    expect(
      new Headers(fetchMock.mock.calls[0]?.[1]?.headers).has('Content-Type'),
    ).toBe(false);
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
