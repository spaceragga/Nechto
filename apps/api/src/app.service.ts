import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Hello world!' };
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'nechto-api',
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    };
  }
}
