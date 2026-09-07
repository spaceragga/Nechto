import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { env } from '../src/config/env';
import { PrismaService } from '../src/prisma/prisma.service';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('UploadsController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const email = `uploads-${Date.now()}@nechto.test`;
  const password = 'password123';
  let cookie: string[];
  let userId: string;

  beforeAll(async () => {
    await mkdir(resolve(env.STORAGE_LOCAL_ROOT), { recursive: true });
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);
    userId = response.body.user.id as string;
    const cookieHeader = response.headers['set-cookie'];
    cookie = Array.isArray(cookieHeader)
      ? cookieHeader
      : [cookieHeader as string];
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('hides unpublished and suspended files from the public', async () => {
    const avatarResponse = await request(app.getHttpServer())
      .post('/profiles/me/avatar')
      .set('Cookie', cookie)
      .attach('file', png, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(201);
    const avatarPath = new URL(avatarResponse.body.avatarUrl as string)
      .pathname;

    await request(app.getHttpServer()).get(avatarPath).expect(404);
    await request(app.getHttpServer())
      .get(avatarPath)
      .set('Cookie', cookie)
      .expect(200);

    await prisma.profile.update({
      where: { userId },
      data: {
        slug: `uploads-${Date.now()}`,
        displayName: 'Uploads Artist',
        acceptPolicies: true,
        publishedAt: new Date(),
      },
    });
    await request(app.getHttpServer()).get(avatarPath).expect(200);

    await request(app.getHttpServer())
      .post('/account/suspend')
      .set('Cookie', cookie)
      .expect(200);
    await request(app.getHttpServer()).get(avatarPath).expect(404);
    await request(app.getHttpServer())
      .get(avatarPath)
      .set('Cookie', cookie)
      .expect(200);
  });
});
