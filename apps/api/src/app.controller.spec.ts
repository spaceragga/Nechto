import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn(),
            getHealth: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AppService);
    controller = moduleRef.get(AppController);
  });

  describe('getHello', () => {
    it('returns the service hello payload', () => {
      const payload = { message: 'Hello world!' };
      jest.spyOn(service, 'getHello').mockReturnValue(payload);

      expect(controller.getHello()).toBe(payload);
    });
  });

  describe('getHealth', () => {
    it('returns the service health payload', async () => {
      const payload = {
        status: 'ok' as const,
        service: 'nechto-api',
        database: 'up' as const,
      };
      jest.spyOn(service, 'getHealth').mockResolvedValue(payload);

      await expect(controller.getHealth()).resolves.toBe(payload);
    });
  });
});
