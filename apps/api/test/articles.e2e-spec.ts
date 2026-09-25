import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import {
  API_ERROR_CODES,
  ARTICLE_BODY_MIN_PUBLISH,
} from '@nechto/api-contract';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { env } from '../src/config/env';
import { PrismaService } from '../src/prisma/prisma.service';
import { removeTestUser } from './remove-test-user';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('ArticlesController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const email = `articles-${Date.now()}@nechto.test`;
  const password = 'password123';
  let cookie: string[];

  beforeAll(async () => {
    const uploadsRoot = resolve(env.STORAGE_LOCAL_ROOT);
    await mkdir(uploadsRoot, { recursive: true });

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);

    const cookieHeader = registerResponse.headers['set-cookie'];
    cookie = Array.isArray(cookieHeader)
      ? cookieHeader
      : [cookieHeader as string];
  });

  afterAll(async () => {
    await removeTestUser(prisma, email);
    await app.close();
  });

  it('publishes an article and serves it on public routes', async () => {
    const slug = `article-artist-${Date.now()}`;
    const body = 'x'.repeat(ARTICLE_BODY_MIN_PUBLISH);

    await request(app.getHttpServer())
      .patch('/profiles/me')
      .set('Cookie', cookie)
      .send({
        displayName: 'Journal Artist',
        slug,
        directions: ['photography'],
        acceptPolicies: true,
      })
      .expect(200);

    await request(app.getHttpServer())
      .post('/works')
      .set('Cookie', cookie)
      .field('title', 'Cover')
      .field('description', 'For the article.')
      .attach('file', png, {
        filename: 'cover.png',
        contentType: 'image/png',
      })
      .expect(201);

    const draft = await request(app.getHttpServer())
      .post('/articles')
      .set('Cookie', cookie)
      .send({
        title: 'Двор без счётчика',
        lede: 'How to look.',
        body,
      })
      .expect(201);

    expect(draft.body).toMatchObject({
      id: expect.any(String),
      title: 'Двор без счётчика',
      publishedAt: null,
    });

    await request(app.getHttpServer())
      .post(`/articles/${draft.body.id}/publish`)
      .set('Cookie', cookie)
      .expect(400)
      .expect((response) => {
        expect(response.body.code).toBe(
          API_ERROR_CODES.ARTICLE_PUBLISH_REQUIREMENTS_NOT_MET,
        );
      });

    await request(app.getHttpServer())
      .post('/profiles/me/publish')
      .set('Cookie', cookie)
      .expect(200);

    const published = await request(app.getHttpServer())
      .post(`/articles/${draft.body.id}/publish`)
      .set('Cookie', cookie)
      .expect(200);

    expect(published.body.publishedAt).toEqual(expect.any(String));

    const bySlug = await request(app.getHttpServer())
      .get(`/articles/profile/${slug}`)
      .expect(200);

    expect(bySlug.body.items).toHaveLength(1);
    expect(bySlug.body.items[0]).toMatchObject({
      id: draft.body.id,
      title: 'Двор без счётчика',
      author: { slug },
    });

    const feed = await request(app.getHttpServer())
      .get('/articles?limit=50')
      .expect(200);
    expect(
      feed.body.items.some((item: { id: string }) => item.id === draft.body.id),
    ).toBe(true);

    const publicArticle = await request(app.getHttpServer())
      .get(`/articles/${draft.body.id}`)
      .expect(200);
    expect(publicArticle.body).toMatchObject({
      id: draft.body.id,
      body,
      author: { slug },
    });

    await request(app.getHttpServer())
      .post(`/articles/${draft.body.id}/unpublish`)
      .set('Cookie', cookie)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/articles/${draft.body.id}`)
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/articles/${draft.body.id}`)
      .set('Cookie', cookie)
      .expect(204);
  });
});
