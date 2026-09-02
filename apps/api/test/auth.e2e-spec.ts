import type { INestApplication } from '@nestjs/common';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { createHash } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const email = `artist-${Date.now()}@nechto.test`;
  const lifecycleEmail = `lifecycle-${Date.now()}@nechto.test`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [email, lifecycleEmail] } },
    });
    await app.close();
  });

  it('registers, reads /auth/me, and logs out', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);

    expect(registerResponse.body).toEqual({
      user: {
        id: expect.any(String),
        email,
      },
    });

    const cookieHeader = registerResponse.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();
    const cookie = Array.isArray(cookieHeader)
      ? cookieHeader
      : [cookieHeader as string];

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(200);

    expect(meResponse.body).toEqual({
      user: {
        id: registerResponse.body.user.id,
        email,
      },
    });

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', cookie)
      .expect(200);

    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('logs in with valid credentials', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(loginResponse.body.user.email).toBe(email);
    expect(loginResponse.headers['set-cookie']).toBeDefined();
  });

  it('rejects invalid login credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);

    expect(response.body).toMatchObject({
      statusCode: 401,
      code: API_ERROR_CODES.INVALID_CREDENTIALS,
    });
  });

  it('rejects a duplicate email with EMAIL_TAKEN', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(409);

    expect(response.body).toMatchObject({
      statusCode: 409,
      code: API_ERROR_CODES.EMAIL_TAKEN,
    });
  });

  it('resets and changes passwords while invalidating old sessions', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: lifecycleEmail, password })
      .expect(201);
    const userId = registerResponse.body.user.id as string;
    const oldCookieHeader = registerResponse.headers['set-cookie'];
    const oldCookie = Array.isArray(oldCookieHeader)
      ? oldCookieHeader
      : [oldCookieHeader as string];
    const rawToken = 'reset-token-that-is-long-enough-for-validation';
    await prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: createHash('sha256').update(rawToken).digest('hex'),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: rawToken, password: 'new-password-1' })
      .expect(200, { ok: true });
    const reusedToken = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: rawToken, password: 'another-password' })
      .expect(400);
    expect(reusedToken.body.code).toBe(API_ERROR_CODES.INVALID_RESET_TOKEN);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', oldCookie)
      .expect(401);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: lifecycleEmail, password: 'new-password-1' })
      .expect(200);
    const resetCookieHeader = loginResponse.headers['set-cookie'];
    const resetCookie = Array.isArray(resetCookieHeader)
      ? resetCookieHeader
      : [resetCookieHeader as string];

    const changeResponse = await request(app.getHttpServer())
      .post('/auth/change-password')
      .set('Cookie', resetCookie)
      .send({
        currentPassword: 'new-password-1',
        newPassword: 'new-password-2',
      })
      .expect(200, { ok: true });
    const changedCookieHeader = changeResponse.headers['set-cookie'];
    const changedCookie = Array.isArray(changedCookieHeader)
      ? changedCookieHeader
      : [changedCookieHeader as string];

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', resetCookie)
      .expect(401);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', changedCookie)
      .expect(200);
  });

  it('returns the same forgot-password response for unknown accounts', async () => {
    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'missing@nechto.test', locale: 'en' })
      .expect(200, { ok: true });
  });
});
