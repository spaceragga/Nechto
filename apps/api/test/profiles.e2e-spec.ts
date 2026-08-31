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
      .send({ displayName: 'Nechto Artist', bio: 'Minsk photos' })
      .expect(200);

    expect(updated.body).toMatchObject({
      userId,
      email,
      displayName: 'Nechto Artist',
      bio: 'Minsk photos',
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

    const publicProfile = await request(app.getHttpServer())
      .get(`/profiles/${userId}`)
      .expect(200);

    expect(publicProfile.body.displayName).toBe('Nechto Artist');
    expect(publicProfile.body.avatarUrl).toBe(avatarResponse.body.avatarUrl);
    expect(publicProfile.body.email).toBeUndefined();

    const avatarPath = new URL(avatarResponse.body.avatarUrl as string)
      .pathname;
    const image = await request(app.getHttpServer())
      .get(avatarPath)
      .expect(200);

    expect(image.headers['content-type']).toMatch(/image\/png/);
    expect(image.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });
});
