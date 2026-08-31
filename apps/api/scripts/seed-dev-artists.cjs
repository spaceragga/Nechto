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
  return fetch(`${apiBaseUrl}${path}`, { ...rest, headers });
}

async function readJson(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }
  return JSON.parse(text);
}

async function expectOk(path, response, allowed = [200, 201, 204]) {
  if (!allowed.includes(response.status)) {
    throw new SeedHttpError(response.status, path, await response.text());
  }
  if (response.status === 204) {
    return {};
  }
  return readJson(response);
}

function imageMime(rawType) {
  const type = (rawType ?? 'image/jpeg').split(';')[0].trim().toLowerCase();
  if (type === 'image/jpg' || type === 'image/pjpeg') {
    return 'image/jpeg';
  }
  if (type === 'image/jpeg' || type === 'image/png' || type === 'image/webp') {
    return type;
  }
  return 'image/jpeg';
}

async function imageBlob(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'NechtoDevSeed/1.0',
      Accept: 'image/jpeg,image/png,image/webp',
    },
  });
  if (!response.ok) {
    throw new Error(`Image fetch ${response.status}: ${url}`);
  }
  const type = imageMime(response.headers.get('content-type'));
  const bytes = Buffer.from(await response.arrayBuffer());
  return new Blob([bytes], { type });
}

async function signIn(email) {
  const register = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (register.status === 201) {
    const cookie = cookieFrom(register);
    if (!cookie) {
      throw new Error(
        `Register succeeded for ${email} but Set-Cookie is missing`,
      );
    }
    return cookie;
  }

  if (register.status !== 409) {
    throw new SeedHttpError(
      register.status,
      '/auth/register',
      await register.text(),
    );
  }

  const login = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const cookie = cookieFrom(login);
  if (login.status !== 200 || !cookie) {
    throw new SeedHttpError(
      login.status,
      '/auth/login',
      `${await login.text()}\nHint: ${email} exists with a different password. Delete the user or set SEED_PASSWORD.`,
    );
  }
  return cookie;
}

async function replaceWorks(cookie, artist) {
  const listed = await expectOk(
    '/works/me',
    await request('/works/me?limit=50', { cookie }),
  );
  for (const work of listed.items ?? []) {
    await expectOk(
      `/works/${work.id}`,
      await request(`/works/${encodeURIComponent(work.id)}`, {
        method: 'DELETE',
        cookie,
      }),
    );
  }

  for (const work of artist.works) {
    const body = new FormData();
    body.append('file', await imageBlob(work.imageUrl), 'work.jpg');
    body.append('title', work.title);
    await expectOk(
      '/works',
      await request('/works', { method: 'POST', body, cookie }),
    );
  }
}

async function seedArtist(artist) {
  const cookie = await signIn(artist.email);

  await expectOk(
    '/profiles/me',
    await request('/profiles/me', {
      method: 'PATCH',
      cookie,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: artist.displayName,
        bio: artist.bio,
        slug: artist.slug,
        directions: artist.directions,
        websiteUrl: artist.websiteUrl,
        instagramUrl: artist.instagramUrl,
        telegramUrl: artist.telegramUrl,
        acceptPolicies: true,
      }),
    }),
  );

  const avatar = new FormData();
  avatar.append('file', await imageBlob(artist.avatarUrl), 'avatar.jpg');
  await expectOk(
    '/profiles/me/avatar',
    await request('/profiles/me/avatar', {
      method: 'POST',
      body: avatar,
      cookie,
    }),
  );

  await replaceWorks(cookie, artist);

  await expectOk(
    '/profiles/me/publish',
    await request('/profiles/me/publish', { method: 'POST', cookie }),
  );

  console.log(`  ${artist.email}  /u/${artist.slug}  ${artist.displayName}`);
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed against NODE_ENV=production');
  }

  const health = await request('/health');
  if (!health.ok) {
    throw new Error(
      `API ${apiBaseUrl}/health failed (${health.status}). Start the API first (docker compose up).`,
    );
  }

  console.log(`Seeding ${catalog.artists.length} artists via ${apiBaseUrl}`);
  for (const artist of catalog.artists) {
    await seedArtist(artist);
  }
  console.log(`Password for all: ${password}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
