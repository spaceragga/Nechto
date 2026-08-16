import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { API_ERROR_CODES } from '@nechto/api-contract';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const email = `artist-${Date.now()}@nechto.test`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
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

    const revoked = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(401);
    expect(revoked.body.code).toBe(API_ERROR_CODES.AUTHENTICATION_REQUIRED);
  });

  it('accepts forgot-password without revealing whether the email exists', async () => {
    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'nobody@nechto.test' })
      .expect(202)
      .expect({ ok: true });
  });

  it('rejects invalid reset and verify tokens', async () => {
    const token = 'a'.repeat(32);
    const reset = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, password: 'new-password' })
      .expect(400);
    expect(reset.body.code).toBe(API_ERROR_CODES.VALIDATION_FAILED);

    const verify = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token })
      .expect(400);
    expect(verify.body.code).toBe(API_ERROR_CODES.VALIDATION_FAILED);
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
    const invalid = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
    expect(invalid.body.code).toBe(API_ERROR_CODES.INVALID_CREDENTIALS);
  });
});
