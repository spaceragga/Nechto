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
import { removeTestUser } from './remove-test-user';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('ProjectsController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const email = `projects-${Date.now()}@nechto.test`;
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
    await removeTestUser(prisma, email);
    await app.close();
  });

  it('assembles a series from owned works and serves it publicly', async () => {
    const slug = `project-artist-${Date.now()}`;
    await request(app.getHttpServer())
      .patch('/profiles/me')
      .set('Cookie', cookie)
      .send({
        displayName: 'Series Artist',
        slug,
        directions: ['photography'],
        acceptPolicies: true,
      })
      .expect(200);

    const workIds: string[] = [];
    for (let index = 0; index < 5; index += 1) {
      const created = await request(app.getHttpServer())
        .post('/works')
        .set('Cookie', cookie)
        .field('title', `Work ${index + 1}`)
        .field('description', `Note ${index + 1}.`)
        .attach('file', png, {
          filename: `work-${index}.png`,
          contentType: 'image/png',
        })
        .expect(201);
      workIds.push(created.body.id as string);
    }

    await request(app.getHttpServer())
      .post('/profiles/me/publish')
      .set('Cookie', cookie)
      .expect(200);

    const created = await request(app.getHttpServer())
      .post('/projects')
      .set('Cookie', cookie)
      .send({
        title: 'Yards',
        description: 'A series.',
        blocks: [
          { kind: 'image', workId: workIds[0] },
          { kind: 'text', body: 'After rain.' },
          { kind: 'image', workId: workIds[1] },
        ],
      })
      .expect(201);

    expect(created.body.blocks).toHaveLength(3);
    expect(created.body.blocks[0]).toMatchObject({
      kind: 'image',
      showTitle: true,
    });
    expect(created.body.blocks[1]).toEqual({
      kind: 'text',
      body: 'After rain.',
    });

    await request(app.getHttpServer())
      .delete(`/works/${workIds[0]}`)
      .set('Cookie', cookie)
      .expect(409)
      .then((response) => {
        expect(response.body.code).toBe(API_ERROR_CODES.WORK_IN_PROJECT);
      });

    const listed = await request(app.getHttpServer())
      .get(`/projects/profile/${slug}`)
      .expect(200);

    expect(listed.body.items).toHaveLength(1);
    expect(listed.body.items[0]).toMatchObject({
      id: created.body.id,
      title: 'Yards',
      coverImageUrl: expect.stringMatching(/\/uploads\/works\//),
      frameImageUrls: [
        expect.stringMatching(/\/uploads\/works\//),
        expect.stringMatching(/\/uploads\/works\//),
      ],
      author: { slug },
    });

    const catalog = await request(app.getHttpServer())
      .get('/projects?limit=50')
      .expect(200);

    expect(
      catalog.body.items.some(
        (item: { id: string }) => item.id === created.body.id,
      ),
    ).toBe(true);

    const photography = await request(app.getHttpServer())
      .get('/projects?limit=50&direction=photography')
      .expect(200);
    expect(
      photography.body.items.some(
        (item: { id: string }) => item.id === created.body.id,
      ),
    ).toBe(true);

    const illustration = await request(app.getHttpServer())
      .get('/projects?limit=50&direction=illustration')
      .expect(200);
    expect(
      illustration.body.items.some(
        (item: { id: string }) => item.id === created.body.id,
      ),
    ).toBe(false);

    const published = await request(app.getHttpServer())
      .get(`/projects/${created.body.id}`)
      .expect(200);

    expect(published.body.author.slug).toBe(slug);
    expect(published.body.blocks[1]).toEqual({
      kind: 'text',
      body: 'After rain.',
    });

    await request(app.getHttpServer())
      .put(`/projects/${created.body.id}/blocks`)
      .set('Cookie', cookie)
      .send({
        blocks: [{ kind: 'image', workId: workIds[1] }],
      })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/projects/${created.body.id}`)
      .set('Cookie', cookie)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/projects/${created.body.id}`)
      .expect(404);
  });
});
