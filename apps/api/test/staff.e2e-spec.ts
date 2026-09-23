import type { NestExpressApplication } from '@nestjs/platform-express';
import { API_ERROR_CODES } from '@nechto/api-contract';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Staff access (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const stamp = Date.now();
  const adminEmail = `staff-admin-${stamp}@nechto.test`;
  const otherEmail = `staff-other-${stamp}@nechto.test`;
  const password = 'password123';
  let adminCookie: string[];
  let adminId: string;
  let otherId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    const adminRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password })
      .expect(201);
    adminId = adminRegister.body.user.id as string;
    const adminHeader = adminRegister.headers['set-cookie'];
    adminCookie = Array.isArray(adminHeader)
      ? adminHeader
      : [adminHeader as string];

    const otherRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: otherEmail, password })
      .expect(201);
    otherId = otherRegister.body.user.id as string;

    await prisma.user.update({
      where: { id: adminId },
      data: { isAdmin: true },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, otherEmail] } },
    });
    await app.close();
  });

  it('rejects anonymous and non-admin callers', async () => {
    await request(app.getHttpServer()).get('/admin/users').expect(401);
    const otherHeader = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: otherEmail, password })
        .expect(200)
    ).headers['set-cookie'];
    const otherCookie = Array.isArray(otherHeader)
      ? otherHeader
      : [otherHeader as string];

    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Cookie', otherCookie)
      .expect(403)
      .expect((response) => {
        expect(response.body.code).toBe(API_ERROR_CODES.FORBIDDEN);
      });
  });

  it('lets an admin list and patch users without unlocking other desks', async () => {
    const listed = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Cookie', adminCookie)
      .expect(200);
    expect(listed.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: adminId,
          email: adminEmail,
          isAdmin: true,
          isCurator: false,
          isModerator: false,
        }),
      ]),
    );

    const filtered = await request(app.getHttpServer())
      .get(`/admin/users?email=${encodeURIComponent(adminEmail.slice(0, 8))}`)
      .set('Cookie', adminCookie)
      .expect(200);
    expect(filtered.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: adminId, email: adminEmail }),
      ]),
    );

    await request(app.getHttpServer())
      .get('/moderation/desk')
      .set('Cookie', adminCookie)
      .expect(403);
    await request(app.getHttpServer())
      .get('/curation/desk')
      .set('Cookie', adminCookie)
      .expect(403);

    const patched = await request(app.getHttpServer())
      .patch(`/admin/users/${otherId}`)
      .set('Cookie', adminCookie)
      .send({ isCurator: true, isModerator: true, isAdmin: false })
      .expect(200);
    expect(patched.body).toMatchObject({
      id: otherId,
      isCurator: true,
      isModerator: true,
      isAdmin: false,
    });

    await request(app.getHttpServer())
      .patch('/admin/users/clstaffmissing000000000001')
      .set('Cookie', adminCookie)
      .send({ isCurator: false, isModerator: false, isAdmin: false })
      .expect(404);
  });

  it('unlocks desks only for their own flags', async () => {
    await prisma.user.update({
      where: { id: adminId },
      data: { isModerator: true, isCurator: true },
    });

    await request(app.getHttpServer())
      .get('/moderation/desk')
      .set('Cookie', adminCookie)
      .expect(200, { reports: [], hiddenWorks: [] });
    await request(app.getHttpServer())
      .get('/curation/desk')
      .set('Cookie', adminCookie)
      .expect(200, {
        pairings: [],
        hangings: [],
        issues: [],
        channels: [],
      });
  });
});
