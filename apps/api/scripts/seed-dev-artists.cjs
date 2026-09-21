'use strict';

const { readFile } = require('node:fs/promises');
const catalog = require('../src/dev/dev-artist-catalog.json');
const seriesByEmail = require('../src/dev/dev-artist-series.json');

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
  const fixture = process.env.SEED_FIXTURE_IMAGE;
  if (fixture) {
    const bytes = await readFile(fixture);
    return new Blob([bytes], { type: 'image/png' });
  }

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

function workCopy(work) {
  return {
    title: work.title,
    description:
      typeof work.description === 'string' ? work.description.trim() : '',
  };
}

async function deleteMyProjects(cookie) {
  const listed = await expectOk(
    '/projects/me',
    await request('/projects/me?limit=50', { cookie }),
  );
  for (const project of listed.items ?? []) {
    await expectOk(
      `/projects/${project.id}`,
      await request(`/projects/${encodeURIComponent(project.id)}`, {
        method: 'DELETE',
        cookie,
      }),
    );
  }
}

async function createOneSeries(cookie, series) {
  const blocks = [];
  for (const block of series.blocks) {
    if (block.kind === 'text' && typeof block.body === 'string') {
      const body = block.body.trim();
      if (body) {
        blocks.push({ kind: 'text', body: body.slice(0, 2000) });
      }
      continue;
    }
    if (block.kind !== 'image' || typeof block.imageUrl !== 'string') {
      continue;
    }

    const copy = workCopy(block);
    const form = new FormData();
    form.append('file', await imageBlob(block.imageUrl), 'series.jpg');
    form.append('title', copy.title);
    form.append('description', copy.description);
    const created = await expectOk(
      '/works',
      await request('/works', { method: 'POST', body: form, cookie }),
    );
    await expectOk(
      `/works/${created.id}`,
      await request(`/works/${encodeURIComponent(created.id)}`, {
        method: 'PATCH',
        cookie,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: true }),
      }),
    );
    blocks.push({
      kind: 'image',
      workId: created.id,
      showTitle: block.showTitle !== false,
    });
  }

  if (!blocks.some((block) => block.kind === 'image')) {
    return;
  }

  await expectOk(
    '/projects',
    await request('/projects', {
      method: 'POST',
      cookie,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: series.title,
        description:
          typeof series.description === 'string' ? series.description : '',
        blocks,
      }),
    }),
  );
}

async function createSeries(cookie, artist) {
  const raw = seriesByEmail[artist.email];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  for (const series of list) {
    if (
      !series ||
      !Array.isArray(series.blocks) ||
      series.blocks.length === 0
    ) {
      continue;
    }
    await createOneSeries(cookie, series);
  }
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
    const copy = workCopy(work);
    const body = new FormData();
    body.append('file', await imageBlob(work.imageUrl), 'work.jpg');
    body.append('title', copy.title);
    body.append('description', copy.description);
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

  await deleteMyProjects(cookie);
  await replaceWorks(cookie, artist);
  await createSeries(cookie, artist);

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
