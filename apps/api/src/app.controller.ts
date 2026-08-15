import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth(@Res({ passthrough: true }) response: Response) {
    const health = await this.appService.getHealth();
    if (health.status !== 'ok') response.status(503);
    return health;
  }

  @Get('live')
  getLiveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  async getReadiness(@Res({ passthrough: true }) response: Response) {
    const health = await this.appService.getHealth();
    if (health.status !== 'ok') response.status(503);
    return {
      status: health.status === 'ok' ? 'ok' : 'unavailable',
      database: health.database,
    };
  }
}
