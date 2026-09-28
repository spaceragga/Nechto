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

describe('DialoguesController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const stamp = Date.now();
  const curatorEmail = `dialogue-curator-${stamp}@nechto.test`;
  const leftEmail = `dialogue-left-${stamp}@nechto.test`;
  const rightEmail = `dialogue-right-${stamp}@nechto.test`;
  const password = 'password123';
  let curatorCookie: string[];
  let curatorId: string;

  async function register(email: string) {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);
    const cookieHeader = response.headers['set-cookie'];
    return {
      id: response.body.user.id as string,
      cookie: Array.isArray(cookieHeader)
        ? cookieHeader
        : [cookieHeader as string],
    };
  }

  async function publishAuthor(
    cookie: string[],
    slug: string,
    displayName: string,
  ) {
    await request(app.getHttpServer())
      .patch('/profiles/me')
      .set('Cookie', cookie)
      .send({
        displayName,
        slug,
        directions: ['photography'],
        acceptPolicies: true,
      })
      .expect(200);

    const work = await request(app.getHttpServer())
      .post('/works')
      .set('Cookie', cookie)
      .field('title', `${displayName} work`)
      .field('description', 'For dialogue.')
      .attach('file', png, {
        filename: `${slug}.png`,
        contentType: 'image/png',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/profiles/me/publish')
      .set('Cookie', cookie)
      .expect(200);

    return work.body.id as string;
  }

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

    const curator = await register(curatorEmail);
    curatorCookie = curator.cookie;
    curatorId = curator.id;
    await prisma.user.update({
      where: { id: curatorId },
      data: { isCurator: true },
    });
  });

  afterAll(async () => {
    await removeTestUser(prisma, curatorEmail);
    await removeTestUser(prisma, leftEmail);
    await removeTestUser(prisma, rightEmail);
    await app.close();
  });

  it('lets a curator publish a pair and feature it publicly', async () => {
    const left = await register(leftEmail);
    const right = await register(rightEmail);
    const leftWorkId = await publishAuthor(
      left.cookie,
      `dlg-left-${stamp}`,
      'Left Artist',
    );
    const rightWorkId = await publishAuthor(
      right.cookie,
      `dlg-right-${stamp}`,
      'Right Artist',
    );

    const created = await request(app.getHttpServer())
      .post('/curation/dialogues')
      .set('Cookie', curatorCookie)
      .send({
        title: 'Двор и кухня',
        note: 'Две комнаты рядом.',
        leftWorkId,
        rightWorkId,
      })
      .expect(201);

    expect(created.body).toMatchObject({
      title: 'Двор и кухня',
      publishedAt: null,
    });

    await request(app.getHttpServer())
      .post(`/curation/dialogues/${created.body.id}/publish`)
      .set('Cookie', curatorCookie)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/curation/dialogues/${created.body.id}/feature`)
      .set('Cookie', curatorCookie)
      .expect(201);

    const listed = await request(app.getHttpServer())
      .get('/dialogues?limit=20')
      .expect(200);
    expect(
      listed.body.items.some(
        (item: { id: string }) => item.id === created.body.id,
      ),
    ).toBe(true);

    const publicDialogue = await request(app.getHttpServer())
      .get(`/dialogues/${created.body.id}`)
      .expect(200);
    expect(publicDialogue.body).toMatchObject({
      id: created.body.id,
      note: 'Две комнаты рядом.',
      left: { id: leftWorkId },
      right: { id: rightWorkId },
    });

    const desk = await request(app.getHttpServer())
      .get('/curation/desk')
      .set('Cookie', curatorCookie)
      .expect(200);
    expect(desk.body.featuredDialogue?.id).toBe(created.body.id);
  });

  it('rejects pairs from the same author', async () => {
    const solo = await register(`dialogue-solo-${stamp}@nechto.test`);
    const workA = await publishAuthor(
      solo.cookie,
      `dlg-solo-a-${stamp}`,
      'Solo Artist',
    );
    const workB = await request(app.getHttpServer())
      .post('/works')
      .set('Cookie', solo.cookie)
      .field('title', 'Second')
      .field('description', 'Same author.')
      .attach('file', png, {
        filename: 'solo-b.png',
        contentType: 'image/png',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/curation/dialogues')
      .set('Cookie', curatorCookie)
      .send({
        title: 'Same author',
        note: '',
        leftWorkId: workA,
        rightWorkId: workB.body.id,
      })
      .expect(400)
      .expect((response) => {
        expect(response.body.code).toBe(API_ERROR_CODES.DIALOGUE_SAME_AUTHOR);
      });

    await removeTestUser(prisma, `dialogue-solo-${stamp}@nechto.test`);
  });
});
