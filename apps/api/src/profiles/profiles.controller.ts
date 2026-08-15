import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  HttpCode,
  Query,
  Delete,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  creatorCatalogQuerySchema,
  type CreatorCatalogQuery,
} from '@nechto/api-contract';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { clearAccessTokenCookie } from '../auth/auth-cookies';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AVATAR_MAX_BYTES } from '../config/avatar-limits';
import { updateProfileSchema, type UpdateProfileDto } from './dto/profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMine(@CurrentUser() user: AuthUser) {
    return this.profilesService.getMine(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMine(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileDto,
  ) {
    return this.profilesService.updateMine(user.id, body);
  }

  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  exportMine(@CurrentUser() user: AuthUser) {
    return this.profilesService.exportMine(user.id);
  }

  @Delete('me')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteMine(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.profilesService.deleteMine(user.id);
    clearAccessTokenCookie(response);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_MAX_BYTES },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profilesService.uploadAvatar(user.id, file);
  }

  @Post('me/publish')
  @UseGuards(JwtAuthGuard)
  publishMine(@CurrentUser() user: AuthUser) {
    return this.profilesService.publishMine(user.id);
  }

  @Get()
  listPublic(
    @Query(new ZodValidationPipe(creatorCatalogQuerySchema))
    query: CreatorCatalogQuery,
  ) {
    return this.profilesService.listPublic(
      query.direction,
      query.cursor,
      query.limit,
    );
  }

  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.profilesService.getPublicBySlug(slug);
  }

  @Post('slug/:slug/contact')
  @HttpCode(204)
  async recordContact(@Param('slug') slug: string) {
    await this.profilesService.recordContact(slug);
  }
}
