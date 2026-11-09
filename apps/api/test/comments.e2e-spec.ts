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

describe('Comments (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const stamp = Date.now();
  const authorEmail = `comment-author-${stamp}@nechto.test`;
  const visitorEmail = `comment-visitor-${stamp}@nechto.test`;
  const moderatorEmail = `comment-mod-${stamp}@nechto.test`;
  const password = 'password123';
  let authorCookie: string[];
  let visitorCookie: string[];
  let moderatorCookie: string[];
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

    const moderator = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: moderatorEmail, password })
      .expect(201);
    moderatorCookie = cookieOf(moderator);
    await prisma.user.update({
      where: { email: moderatorEmail },
      data: { isModerator: true },
    });

    const slug = `comment-artist-${stamp}`;
    await request(app.getHttpServer())
      .patch('/profiles/me')
      .set('Cookie', authorCookie)
      .send({
        displayName: 'Comment Artist',
        slug,
        acceptPolicies: true,
      })
      .expect(200);
    const work = await request(app.getHttpServer())
      .post('/works')
      .set('Cookie', authorCookie)
      .field('title', 'Comment work')
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
    await removeTestUser(prisma, moderatorEmail);
    await app.close();
  });

  it('lists, creates, notifies, and deletes comments on a published work', async () => {
    await request(app.getHttpServer())
      .get('/comments')
      .query({ targetType: 'work', targetId: workId })
      .expect(200)
      .expect({ items: [], nextCursor: null });

    await request(app.getHttpServer())
      .post('/comments')
      .send({ targetType: 'work', targetId: workId, body: 'Сильный кадр.' })
      .expect(401);

    const created = await request(app.getHttpServer())
      .post('/comments')
      .set('Cookie', visitorCookie)
      .send({ targetType: 'work', targetId: workId, body: 'Сильный кадр.' })
      .expect(201);
    expect(created.body).toMatchObject({
      body: 'Сильный кадр.',
      targetType: 'work',
      targetId: workId,
      canDelete: true,
    });

    const listed = await request(app.getHttpServer())
      .get('/comments')
      .query({ targetType: 'work', targetId: workId })
      .expect(200);
    expect(listed.body.items).toHaveLength(1);
    expect(listed.body.items[0].canDelete).toBe(false);

    const inbox = await request(app.getHttpServer())
      .get('/notifications')
      .set('Cookie', authorCookie)
      .expect(200);
    expect(inbox.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'work_commented',
          work: expect.objectContaining({ id: workId }),
        }),
      ]),
    );

    await request(app.getHttpServer())
      .delete(`/comments/${created.body.id}`)
      .set('Cookie', visitorCookie)
      .expect(204);

    const again = await request(app.getHttpServer())
      .post('/comments')
      .set('Cookie', visitorCookie)
      .send({ targetType: 'work', targetId: workId, body: 'Ещё раз.' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/comments/${again.body.id}`)
      .set('Cookie', authorCookie)
      .expect(204);

    const third = await request(app.getHttpServer())
      .post('/comments')
      .set('Cookie', visitorCookie)
      .send({ targetType: 'work', targetId: workId, body: 'Модератор.' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/comments/${third.body.id}`)
      .set('Cookie', moderatorCookie)
      .expect(204);

    await request(app.getHttpServer())
      .post('/comments')
      .set('Cookie', visitorCookie)
      .send({ targetType: 'work', targetId: workId, body: '' })
      .expect(400)
      .expect((response) => {
        expect(response.body.code).toBe(API_ERROR_CODES.VALIDATION_FAILED);
      });
  });
});

function cookieOf(response: request.Response): string[] {
  const header = response.headers['set-cookie'];
  return Array.isArray(header) ? header : [header as string];
}
