import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
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
    it('returns the service health payload', () => {
      const payload = {
        status: 'ok',
        service: 'nechto-api',
        databaseUrlConfigured: true,
      };
      jest.spyOn(service, 'getHealth').mockReturnValue(payload);

      expect(controller.getHealth()).toBe(payload);
    });
  });
});
