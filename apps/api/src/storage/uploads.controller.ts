import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { OptionalUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { keyFromRouteParam, UploadsService } from './uploads.service';

@Controller('uploads')
@SkipThrottle()
@UseGuards(OptionalJwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Get('{*path}')
  async get(
    @Param('path') path: string | string[],
    @OptionalUser() user: AuthUser | null,
    @Res() response: Response,
  ): Promise<void> {
    const object = await this.uploads.readPublicObject(
      keyFromRouteParam(path),
      user,
    );
    if (!object) {
      response.status(404).end();
      return;
    }

    response.setHeader('Content-Type', object.contentType);
    response.setHeader('Cache-Control', 'private, no-store');
    response.status(200).send(object.body);
  }
}
