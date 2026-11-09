'use strict';

const catalog = require('../src/dev/dev-artist-catalog.json');

const apiBaseUrl = (
  process.env.SEED_API_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');
const password = process.env.SEED_PASSWORD ?? catalog.password;

class SeedHttpError extends Error {
  constructor(status, path, body) {
    super(`SEED ${path} → ${status}: ${body}`);
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

function cookieFrom(response) {
  const cookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [];
  const token = cookies.find((value) =>
    value.startsWith('nechto_access_token='),
  );
  return token ? token.split(';')[0] : '';
}

async function request(path, init = {}) {
  const { cookie, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  if (cookie) {
    headers.set('Cookie', cookie);
  }
  if (rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${apiBaseUrl}${path}`, { ...rest, headers });
}

async function expectOk(path, response, allowed = [200, 201, 204]) {
  if (!allowed.includes(response.status)) {
    throw new SeedHttpError(response.status, path, await response.text());
  }
  if (response.status === 204) {
    return {};
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function login(email) {
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const body = await expectOk('/auth/login', response);
  return { cookie: cookieFrom(response), user: body.user };
}

async function main() {
  const artists = catalog.artists ?? [];
  if (artists.length < 2) {
    throw new Error('Need at least two seeded artists for social graph');
  }
  const [first, second] = artists;
  const visitor = await login(second.email);
  const works = await expectOk(
    `/works/profile/${first.slug}`,
    await request(`/works/profile/${first.slug}`),
  );
  const work = works.items?.[0];
  if (!work) {
    throw new Error(`No published work on ${first.slug}`);
  }
  await expectOk(
    '/social/follows',
    await request('/social/follows', {
      method: 'POST',
      cookie: visitor.cookie,
      body: JSON.stringify({ slug: first.slug }),
    }),
  );
  await expectOk(
    '/social/likes',
    await request('/social/likes', {
      method: 'POST',
      cookie: visitor.cookie,
      body: JSON.stringify({ targetType: 'work', targetId: work.id }),
    }),
  );
  await expectOk(
    '/social/views',
    await request('/social/views', {
      method: 'POST',
      body: JSON.stringify({ targetType: 'work', targetId: work.id }),
    }),
  );
  console.log(
    `social seeded: ${second.slug} follows ${first.slug}, likes ${work.id}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
