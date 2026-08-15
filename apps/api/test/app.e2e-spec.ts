import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  const prisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterEach(() => {
    prisma.$queryRaw.mockReset();
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / returns hello world', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ message: 'Hello world!' });
  });

  it('GET /health returns ok status with database up', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'nechto-api',
      database: 'up',
      release: 'development',
    });
  });

  it('GET /ready returns ok when the database is up', async () => {
    await request(app.getHttpServer())
      .get('/ready')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });

  it('GET /live stays ok even when the database probe fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

    await request(app.getHttpServer())
      .get('/live')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('GET /ready and /health return 503 when the database is down', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

    await request(app.getHttpServer())
      .get('/ready')
      .expect(503)
      .expect({ status: 'unavailable', database: 'down' });

    const health = await request(app.getHttpServer())
      .get('/health')
      .expect(503);
    expect(health.body).toMatchObject({
      status: 'degraded',
      database: 'down',
    });
  });
});
