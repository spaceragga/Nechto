import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { env } from '../src/config/env';
import { PrismaService } from '../src/prisma/prisma.service';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('WorksController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const email = `works-${Date.now()}@nechto.test`;
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
    app.useStaticAssets(uploadsRoot, {
      prefix: '/uploads/',
    });
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
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('uploads works, publishes the profile, and lists them publicly', async () => {
    await request(app.getHttpServer())
      .patch('/profiles/me')
      .set('Cookie', cookie)
      .send({
        displayName: 'Works Artist',
        slug: `works-artist-${Date.now()}`,
        directions: ['photography'],
        acceptPolicies: true,
      })
      .expect(200)
      .then((response) => {
        expect(response.body.slug).toMatch(/^works-artist-/);
        expect(response.body.directions).toEqual(['photography']);
        expect(response.body.acceptPolicies).toBe(true);
      });

    const slug = (
      await request(app.getHttpServer())
        .get('/profiles/me')
        .set('Cookie', cookie)
        .expect(200)
    ).body.slug as string;

    await request(app.getHttpServer())
      .post('/profiles/me/publish')
      .set('Cookie', cookie)
      .expect(403)
      .then((response) => {
        expect(response.body.code).toBe(
          API_ERROR_CODES.PUBLISH_REQUIREMENTS_NOT_MET,
        );
      });

    const workIds: string[] = [];
    for (let index = 0; index < 5; index += 1) {
      const created = await request(app.getHttpServer())
        .post('/works')
        .set('Cookie', cookie)
        .field('title', `Work ${index + 1}`)
        .attach('file', png, {
          filename: `work-${index}.png`,
          contentType: 'image/png',
        })
        .expect(201);

      expect(created.body.title).toBe(`Work ${index + 1}`);
      expect(created.body.imageUrl).toMatch(/\/uploads\/works\//);
      workIds.push(created.body.id as string);
    }

    await request(app.getHttpServer())
      .post('/profiles/me/publish')
      .set('Cookie', cookie)
      .expect(200)
      .then((response) => {
        expect(response.body.publishedAt).toBeTruthy();
        expect(response.body.workCount).toBe(5);
      });

    const publicProfile = await request(app.getHttpServer())
      .get(`/profiles/by-slug/${slug}`)
      .expect(200);

    expect(publicProfile.body.displayName).toBe('Works Artist');
    expect(publicProfile.body.email).toBeUndefined();

    const listed = await request(app.getHttpServer())
      .get(`/works/profile/${slug}`)
      .expect(200);

    expect(listed.body.items).toHaveLength(5);

    const catalog = await request(app.getHttpServer())
      .get('/profiles?direction=photography')
      .expect(200);

    expect(
      catalog.body.items.some((item: { slug: string }) => item.slug === slug),
    ).toBe(true);

    const feed = await request(app.getHttpServer()).get('/works').expect(200);
    expect(
      feed.body.items.some(
        (item: { author: { slug: string } }) => item.author.slug === slug,
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .delete(`/works/${workIds[0]}`)
      .set('Cookie', cookie)
      .expect(204);

    const afterDelete = await request(app.getHttpServer())
      .get('/profiles/me')
      .set('Cookie', cookie)
      .expect(200);

    expect(afterDelete.body.publishedAt).toBeNull();
    expect(afterDelete.body.workCount).toBe(4);
  });
});
