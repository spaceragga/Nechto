import type { INestApplication } from '@nestjs/common';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { Test, type TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AccountController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const email = `account-${Date.now()}@nechto.test`;
  const password = 'password123';
  const slug = `account-${Date.now()}`;
  let cookie: string[];
  let userId: string;
  let workId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
    prisma = app.get(PrismaService);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);
    const cookieHeader = response.headers['set-cookie'];
    cookie = Array.isArray(cookieHeader)
      ? cookieHeader
      : [cookieHeader as string];
    userId = response.body.user.id as string;
    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        slug,
        displayName: 'Account lifecycle',
        acceptPolicies: true,
        publishedAt: new Date(),
      },
    });
    const work = await prisma.work.create({
      data: {
        profileId: profile.id,
        title: 'Lifecycle work',
        description: 'Visibility regression',
        imageKey: 'works/lifecycle/test.png',
      },
    });
    workId = work.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('hides and restores a published profile while owner access remains', async () => {
    await request(app.getHttpServer())
      .get(`/profiles/by-slug/${slug}`)
      .expect(200);

    const suspended = await request(app.getHttpServer())
      .post('/account/suspend')
      .set('Cookie', cookie)
      .expect(200);
    expect(suspended.body.suspendedAt).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .get(`/profiles/by-slug/${slug}`)
      .expect(404);
    await request(app.getHttpServer()).get(`/works/${workId}`).expect(404);
    const feed = await request(app.getHttpServer()).get('/works').expect(200);
    expect(feed.body.items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: workId })]),
    );
    await request(app.getHttpServer())
      .get('/profiles/me')
      .set('Cookie', cookie)
      .expect(200);

    const restored = await request(app.getHttpServer())
      .post('/account/restore')
      .set('Cookie', cookie)
      .expect(200);
    expect(restored.body.suspendedAt).toBeNull();
    await request(app.getHttpServer())
      .get(`/profiles/by-slug/${slug}`)
      .expect(200);
    await request(app.getHttpServer()).get(`/works/${workId}`).expect(200);
  });

  it('requires the current password and permanently deletes the account', async () => {
    const invalid = await request(app.getHttpServer())
      .delete('/account')
      .set('Cookie', cookie)
      .send({ password: 'wrong-password' })
      .expect(401);
    expect(invalid.body.code).toBe(API_ERROR_CODES.CURRENT_PASSWORD_INVALID);

    await request(app.getHttpServer())
      .delete('/account')
      .set('Cookie', cookie)
      .send({ password })
      .expect(200, { ok: true });
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(401);
    await expect(
      prisma.user.findUnique({ where: { id: userId } }),
    ).resolves.toBeNull();
  });
});
