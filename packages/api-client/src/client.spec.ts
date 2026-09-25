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

  it('sends account lifecycle and password requests to typed routes', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await client.forgotPassword({
      email: 'a@nechto.test',
      locale: 'en',
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/auth/forgot-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@nechto.test', locale: 'en' }),
      }),
    );

    await client.resetPassword({
      token: 'reset-token',
      password: 'new-password',
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/auth/reset-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          token: 'reset-token',
          password: 'new-password',
        }),
      }),
    );

    await client.changePassword({
      currentPassword: 'password123',
      newPassword: 'new-password',
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/auth/change-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          currentPassword: 'password123',
          newPassword: 'new-password',
        }),
      }),
    );

    await client.suspendAccount();
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/account/suspend',
      expect.objectContaining({ method: 'POST' }),
    );

    await client.restoreAccount();
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/account/restore',
      expect.objectContaining({ method: 'POST' }),
    );

    await client.deleteAccount({ password: 'password123' });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/account',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ password: 'password123' }),
      }),
    );
  });

  it('calls staff desk and admin user routes', async () => {
    fetchMock.mockImplementation(async () => {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await client.listAdminUsers();
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/admin/users',
      expect.objectContaining({ credentials: 'include' }),
    );

    await client.listAdminUsers({ email: 'ad' });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/admin/users?email=ad',
      expect.objectContaining({ credentials: 'include' }),
    );

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'u1',
          email: 'a@nechto.test',
          displayName: null,
          isCurator: true,
          isModerator: false,
          isAdmin: false,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    await client.updateStaffAccess('u1', {
      isCurator: true,
      isModerator: false,
      isAdmin: false,
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/admin/users/u1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          isCurator: true,
          isModerator: false,
          isAdmin: false,
        }),
      }),
    );

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          reports: [],
          hiddenWorks: [],
          liveArticles: [],
          hiddenArticles: [],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    await expect(client.getModerationDesk()).resolves.toEqual({
      reports: [],
      hiddenWorks: [],
      liveArticles: [],
      hiddenArticles: [],
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/moderation/desk',
      expect.anything(),
    );

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          pairings: [],
          hangings: [],
          issues: [],
          channels: [],
          featuredArticle: null,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    await expect(client.getCurationDesk()).resolves.toMatchObject({
      pairings: [],
      featuredArticle: null,
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3001/curation/desk',
      expect.anything(),
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

  it('creates a project and replaces blocks', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'pr1',
          title: 'Yards',
          description: '',
          createdAt: '2026-08-31T00:00:00.000Z',
          blocks: [],
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

    await client.createMyProject({
      title: 'Yards',
      description: '',
      blocks: [],
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:3001/projects');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({
        title: 'Yards',
        description: '',
        blocks: [],
      }),
    });

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'pr1',
          title: 'Yards',
          description: '',
          createdAt: '2026-08-31T00:00:00.000Z',
          blocks: [{ kind: 'text', body: 'After rain.' }],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    await client.replaceMyProjectBlocks('pr1', {
      blocks: [{ kind: 'text', body: 'After rain.' }],
    });
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'http://localhost:3001/projects/pr1/blocks',
    );
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: 'PUT' });
  });

  it('lists published series for the house', async () => {
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

    await client.listPublishedProjects({ limit: 12 });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://localhost:3001/projects?limit=12',
    );
  });

  it('calls article author and public routes', async () => {
    fetchMock.mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes('/curation/') || href.includes('/moderation/')) {
        return new Response(
          JSON.stringify({
            id: 'a1',
            title: 'Двор',
            lede: '',
            coverImageUrl: null,
            publishedAt: '2026-09-25T00:00:00.000Z',
            featuredAt: null,
            author: {
              slug: 'kasia-voit',
              displayName: 'Кася',
              avatarUrl: null,
              directions: [],
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
      if (
        href.includes('/articles/profile/') ||
        href.endsWith('/articles?limit=12')
      ) {
        return new Response(JSON.stringify({ items: [], nextCursor: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({
          id: 'a1',
          title: 'Двор',
          lede: '',
          body: 'x'.repeat(400),
          coverImageUrl: null,
          coverWorkId: null,
          publishedAt: null,
          featuredAt: null,
          hidden: false,
          createdAt: '2026-09-25T00:00:00.000Z',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    });

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await client.createMyArticle({
      title: 'Двор',
      lede: '',
      body: 'x'.repeat(400),
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:3001/articles');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });

    await client.listArticlesBySlug('kasia-voit', { limit: 12 });
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'http://localhost:3001/articles/profile/kasia-voit?limit=12',
    );

    await client.listPublishedArticles({ limit: 12 });
    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      'http://localhost:3001/articles?limit=12',
    );

    await client.featureArticle('a1');
    expect(fetchMock.mock.calls[3]?.[0]).toBe(
      'http://localhost:3001/curation/articles/a1/feature',
    );
    expect(fetchMock.mock.calls[3]?.[1]).toMatchObject({ method: 'POST' });

    await client.hideArticle('a1');
    expect(fetchMock.mock.calls[4]?.[0]).toBe(
      'http://localhost:3001/moderation/articles/a1/hide',
    );
  });

  it('lists published series filtered by direction', async () => {
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

    await client.listPublishedProjects({
      direction: 'photography',
      limit: 12,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://localhost:3001/projects?limit=12&direction=photography',
    );
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
