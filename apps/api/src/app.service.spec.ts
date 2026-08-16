import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppService', () => {
  let service: AppService;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(AppService);
  });

  describe('getHello', () => {
    it('returns the hello world payload', () => {
      expect(service.getHello()).toEqual({ message: 'Hello world!' });
    });
  });

  describe('getHealth', () => {
    it('reports ok when the database responds', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      await expect(service.getHealth()).resolves.toEqual({
        status: 'ok',
        service: 'nechto-api',
        database: 'up',
      });
    });

    it('reports degraded when the database is unavailable', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

      await expect(service.getHealth()).resolves.toEqual({
        status: 'degraded',
        service: 'nechto-api',
        database: 'down',
      });
    });
  });
});
