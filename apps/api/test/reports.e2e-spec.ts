import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { Test, type TestingModule } from '@nestjs/testing';
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

describe('Reports (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const stamp = Date.now();
  const authorEmail = `report-author-${stamp}@nechto.test`;
  const visitorEmail = `report-visitor-${stamp}@nechto.test`;
  const moderatorEmail = `report-mod-${stamp}@nechto.test`;
  const password = 'password123';
  let authorCookie: string[];
  let visitorCookie: string[];
  let moderatorCookie: string[];
  let slug: string;

  beforeAll(async () => {
    await mkdir(resolve(env.STORAGE_LOCAL_ROOT), { recursive: true });
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    const author = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: authorEmail, password })
      .expect(201);
    authorCookie = cookieOf(author);

    const visitor = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: visitorEmail, password })
      .expect(201);
    visitorCookie = cookieOf(visitor);

    const moderator = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: moderatorEmail, password })
      .expect(201);
    moderatorCookie = cookieOf(moderator);
    await prisma.user.update({
      where: { email: moderatorEmail },
      data: { isModerator: true },
    });

    slug = `report-artist-${stamp}`;
    await request(app.getHttpServer())
      .patch('/profiles/me')
      .set('Cookie', authorCookie)
      .send({
        displayName: 'Report Artist',
        slug,
        acceptPolicies: true,
      })
      .expect(200);
    await request(app.getHttpServer())
      .post('/works')
      .set('Cookie', authorCookie)
      .field('title', 'Report work')
      .attach('file', png, { filename: 'work.png', contentType: 'image/png' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/profiles/me/publish')
      .set('Cookie', authorCookie)
      .expect(200);
  });

  afterAll(async () => {
    await removeTestUser(prisma, authorEmail);
    await removeTestUser(prisma, visitorEmail);
    await removeTestUser(prisma, moderatorEmail);
    await app.close();
  });

  it('accepts a public report and lets a moderator close it', async () => {
    await request(app.getHttpServer())
      .post('/reports')
      .send({ slug, reason: 'spam' })
      .expect(400)
      .expect((response) => {
        expect(response.body.code).toBe(API_ERROR_CODES.VALIDATION_FAILED);
      });

    await request(app.getHttpServer())
      .post('/reports')
      .set('Cookie', authorCookie)
      .send({ slug, reason: 'spam' })
      .expect(403);

    await request(app.getHttpServer())
      .post('/reports')
      .send({
        slug,
        reason: 'harassment',
        details: 'rude bio',
        email: 'anon@nechto.test',
      })
      .expect(201)
      .expect({ ok: true });

    const desk = await request(app.getHttpServer())
      .get('/moderation/desk')
      .set('Cookie', moderatorCookie)
      .expect(200);

    const open = (
      desk.body.reports as Array<{
        id: string;
        status: string;
        profile: { slug: string };
      }>
    ).find((item) => item.profile.slug === slug && item.status === 'open');
    expect(open).toBeTruthy();

    const resolved = await request(app.getHttpServer())
      .post(`/moderation/reports/${open?.id}/resolve`)
      .set('Cookie', visitorCookie)
      .expect(403);

    expect(resolved.body.code).toBe(API_ERROR_CODES.FORBIDDEN);

    await request(app.getHttpServer())
      .post(`/moderation/reports/${open?.id}/resolve`)
      .set('Cookie', moderatorCookie)
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('resolved');
        expect(response.body.email).toBe('anon@nechto.test');
      });
  });
});

function cookieOf(response: request.Response): string[] {
  const header = response.headers['set-cookie'];
  return Array.isArray(header) ? header : [header as string];
}
