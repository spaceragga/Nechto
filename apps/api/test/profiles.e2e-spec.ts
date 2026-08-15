import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { env } from '../src/config/env';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ProfilesController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const email = `profile-${Date.now()}@nechto.test`;
  const password = 'password123';
  let cookie: string[];
  let userId: string;

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

    userId = registerResponse.body.user.id as string;
    const cookieHeader = registerResponse.headers['set-cookie'];
    cookie = Array.isArray(cookieHeader)
      ? cookieHeader
      : [cookieHeader as string];
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('updates profile fields and serves uploaded avatar', async () => {
    const updated = await request(app.getHttpServer())
      .patch('/profiles/me')
      .set('Cookie', cookie)
      .send({
        slug: `artist-${userId}`,
        displayName: 'Nechto Artist',
        bio: 'Belarus photos',
        directions: ['photography'],
        websiteUrl: 'https://example.com',
        acceptPolicies: true,
      })
      .expect(200);

    expect(updated.body).toMatchObject({
      userId,
      email,
      displayName: 'Nechto Artist',
      bio: 'Belarus photos',
      avatarUrl: null,
    });

    // Minimal valid 1x1 PNG
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );

    const avatarResponse = await request(app.getHttpServer())
      .post('/profiles/me/avatar')
      .set('Cookie', cookie)
      .attach('file', png, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(avatarResponse.body.avatarUrl).toMatch(/\/uploads\/avatars\//);

    const avatarPath = new URL(avatarResponse.body.avatarUrl as string)
      .pathname;
    const image = await request(app.getHttpServer())
      .get(avatarPath)
      .expect(200);

    expect(image.headers['content-type']).toMatch(/image\/webp/);

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });

    for (let index = 0; index < 5; index += 1) {
      const work = await request(app.getHttpServer())
        .post('/works')
        .set('Cookie', cookie)
        .field('title', `Work ${index + 1}`)
        .field('altText', `Work ${index + 1} preview`)
        .attach('file', png, {
          filename: `work-${index + 1}.png`,
          contentType: 'image/png',
        })
        .expect(201);
      await request(app.getHttpServer())
        .patch(`/works/${work.body.id as string}`)
        .set('Cookie', cookie)
        .send({ status: 'PUBLISHED' })
        .expect(200);
    }

    await request(app.getHttpServer())
      .post('/profiles/me/publish')
      .set('Cookie', cookie)
      .expect(201);

    const publicProfile = await request(app.getHttpServer())
      .get(`/profiles/slug/artist-${userId}`)
      .expect(200);
    expect(publicProfile.body.profile).not.toHaveProperty('email');
    expect(publicProfile.body.works).toHaveLength(5);

    await request(app.getHttpServer())
      .post(`/profiles/slug/artist-${userId}/report`)
      .send({ reason: 'spam', details: 'Promotional links' })
      .expect(202);

    const adminEmail = `admin-${Date.now()}@nechto.test`;
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password })
      .expect(201);
    await prisma.user.update({
      where: { id: adminResponse.body.user.id as string },
      data: { role: 'ADMIN' },
    });
    const adminCookieHeader = adminResponse.headers['set-cookie'];
    const adminCookie = Array.isArray(adminCookieHeader)
      ? adminCookieHeader
      : [adminCookieHeader as string];

    const reports = await request(app.getHttpServer())
      .get('/admin/moderation/reports')
      .set('Cookie', adminCookie)
      .expect(200);
    expect(reports.body[0]).toMatchObject({
      profileSlug: `artist-${userId}`,
      reason: 'spam',
      status: 'OPEN',
    });

    await request(app.getHttpServer())
      .patch(`/admin/moderation/reports/${reports.body[0].id as string}`)
      .set('Cookie', adminCookie)
      .send({
        status: 'RESOLVED',
        suspendProfile: true,
        note: 'Spam portfolio',
      })
      .expect(204);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(401);
    await request(app.getHttpServer())
      .get(`/profiles/slug/artist-${userId}`)
      .expect(404);
  });
});
