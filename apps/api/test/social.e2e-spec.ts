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

describe('Social engagement (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const stamp = Date.now();
  const authorEmail = `social-author-${stamp}@nechto.test`;
  const visitorEmail = `social-visitor-${stamp}@nechto.test`;
  const password = 'password123';
  const slug = `social-artist-${stamp}`;
  let authorCookie: string[];
  let visitorCookie: string[];
  let workId: string;

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

    await request(app.getHttpServer())
      .patch('/profiles/me')
      .set('Cookie', authorCookie)
      .send({
        displayName: 'Social Artist',
        slug,
        acceptPolicies: true,
      })
      .expect(200);
    const work = await request(app.getHttpServer())
      .post('/works')
      .set('Cookie', authorCookie)
      .field('title', 'Social work')
      .attach('file', png, { filename: 'work.png', contentType: 'image/png' })
      .expect(201);
    workId = work.body.id as string;
    await request(app.getHttpServer())
      .post('/profiles/me/publish')
      .set('Cookie', authorCookie)
      .expect(200);
  });

  afterAll(async () => {
    await removeTestUser(prisma, authorEmail);
    await removeTestUser(prisma, visitorEmail);
    await app.close();
  });

  it('records unique views, likes, and follows', async () => {
    const viewed = await request(app.getHttpServer())
      .post('/social/views')
      .send({ targetType: 'work', targetId: workId })
      .expect(200);
    expect(viewed.body.viewCount).toBe(1);
    expect(viewed.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('nechto_viewer=')]),
    );

    await request(app.getHttpServer())
      .post('/social/views')
      .set('Cookie', cookieOf(viewed))
      .send({ targetType: 'work', targetId: workId })
      .expect(200)
      .expect((response) => {
        expect(response.body.viewCount).toBe(1);
      });

    await request(app.getHttpServer())
      .post('/social/likes')
      .send({ targetType: 'work', targetId: workId })
      .expect(401);

    const liked = await request(app.getHttpServer())
      .post('/social/likes')
      .set('Cookie', visitorCookie)
      .send({ targetType: 'work', targetId: workId })
      .expect(200);
    expect(liked.body).toMatchObject({ likeCount: 1, likedByMe: true });

    const inbox = await request(app.getHttpServer())
      .get('/notifications')
      .set('Cookie', authorCookie)
      .expect(200);
    expect(inbox.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'work_liked',
          work: expect.objectContaining({ id: workId }),
        }),
      ]),
    );

    await request(app.getHttpServer())
      .post('/social/follows')
      .set('Cookie', authorCookie)
      .send({ slug })
      .expect(400)
      .expect((response) => {
        expect(response.body.code).toBe(API_ERROR_CODES.CANNOT_FOLLOW_SELF);
      });

    const followed = await request(app.getHttpServer())
      .post('/social/follows')
      .set('Cookie', visitorCookie)
      .send({ slug })
      .expect(200);
    expect(followed.body).toEqual({ followerCount: 1, following: true });

    await request(app.getHttpServer())
      .delete('/social/likes')
      .set('Cookie', visitorCookie)
      .send({ targetType: 'work', targetId: workId })
      .expect(200)
      .expect((response) => {
        expect(response.body.likedByMe).toBe(false);
      });
  });
});

function cookieOf(response: request.Response): string[] {
  const header = response.headers['set-cookie'];
  return Array.isArray(header) ? header : [header as string];
}
