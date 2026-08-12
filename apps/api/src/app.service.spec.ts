import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  describe('getHello', () => {
    it('returns the hello world payload', () => {
      expect(service.getHello()).toEqual({ message: 'Hello world!' });
    });
  });

  describe('getHealth', () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;

    afterEach(() => {
      if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = originalDatabaseUrl;
      }
    });

    it('reports healthy status and service name', () => {
      delete process.env.DATABASE_URL;

      expect(service.getHealth()).toEqual({
        status: 'ok',
        service: 'nechto-api',
        databaseUrlConfigured: false,
      });
    });

    it('marks database URL as configured when env is set', () => {
      process.env.DATABASE_URL = 'postgresql://nechto:nechto@localhost:5432/nechto';

      expect(service.getHealth().databaseUrlConfigured).toBe(true);
    });
  });
});
