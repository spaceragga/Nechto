import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  listCreatorsQuerySchema,
  type ListCreatorsQuery,
} from '@nechto/api-contract';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { imageUploadInterceptor } from '../storage/image-upload.interceptor';
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

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(imageUploadInterceptor())
  uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profilesService.uploadAvatar(user.id, file);
  }

  @Post('me/publish')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  publishMine(@CurrentUser() user: AuthUser) {
    return this.profilesService.publishMine(user.id);
  }

  @Post('me/unpublish')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  unpublishMine(@CurrentUser() user: AuthUser) {
    return this.profilesService.unpublishMine(user.id);
  }

  @Get()
  listPublished(
    @Query(new ZodValidationPipe(listCreatorsQuerySchema))
    query: ListCreatorsQuery,
  ) {
    return this.profilesService.listPublished(query);
  }

  @Get('by-slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.profilesService.getPublishedBySlug(slug);
  }

  @Get(':userId')
  getByUserId(@Param('userId') userId: string) {
    return this.profilesService.getByUserId(userId);
  }
}
