import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  cursorPageQuerySchema,
  engagementQuerySchema,
  engagementTargetSchema,
  followMarksQuerySchema,
  followSlugSchema,
  type AuthUser,
  type CursorPageQuery,
  type EngagementQuery,
  type EngagementTargetDto,
  type FollowMarksQuery,
  type FollowSlugDto,
} from '@nechto/api-contract';
import type { Request, Response } from 'express';
import {
  CurrentUser,
  OptionalUser,
} from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ContentEngagementService } from './content-engagement.service';
import { EngagementService } from './engagement.service';
import { FollowService } from './follow.service';
import { ensureViewerKey } from './viewer-key';

@Controller('social')
export class SocialController {
  constructor(
    private readonly content: ContentEngagementService,
    private readonly engagement: EngagementService,
    private readonly follows: FollowService,
  ) {}

  @Get('engagement')
  @UseGuards(OptionalJwtAuthGuard)
  engagementSnapshot(
    @Query(new ZodValidationPipe(engagementQuerySchema)) query: EngagementQuery,
    @OptionalUser() user: AuthUser | null,
  ) {
    return this.content.snapshot(query, user?.id ?? null);
  }

  @Post('views')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(200)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  recordView(
    @Body(new ZodValidationPipe(engagementTargetSchema))
    body: EngagementTargetDto,
    @OptionalUser() user: AuthUser | null,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const viewerKey = ensureViewerKey(request, response);
    return this.content.recordView(body, viewerKey, user?.id ?? null);
  }

  @Post('likes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  like(
    @Body(new ZodValidationPipe(engagementTargetSchema))
    body: EngagementTargetDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.engagement.like(body, user);
  }

  @Delete('likes')
  @UseGuards(JwtAuthGuard)
  unlike(
    @Body(new ZodValidationPipe(engagementTargetSchema))
    body: EngagementTargetDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.engagement.unlike(body, user);
  }

  @Get('following/marks')
  @UseGuards(JwtAuthGuard)
  followedMarks(
    @Query(new ZodValidationPipe(followMarksQuerySchema))
    query: FollowMarksQuery,
    @CurrentUser() user: AuthUser,
  ) {
    return this.follows.followedSlugs(user.id, query.slugs);
  }

  @Get('following')
  @UseGuards(JwtAuthGuard)
  listFollowing(
    @Query(new ZodValidationPipe(cursorPageQuerySchema)) query: CursorPageQuery,
    @CurrentUser() user: AuthUser,
  ) {
    return this.follows.listFollowing(user.id, query);
  }

  @Get('follows')
  @UseGuards(OptionalJwtAuthGuard)
  followStatus(
    @Query(new ZodValidationPipe(followSlugSchema)) query: FollowSlugDto,
    @OptionalUser() user: AuthUser | null,
  ) {
    return this.follows.status(query.slug, user?.id ?? null);
  }

  @Post('follows')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  follow(
    @Body(new ZodValidationPipe(followSlugSchema)) body: FollowSlugDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.follows.follow(body.slug, user);
  }

  @Delete('follows')
  @UseGuards(JwtAuthGuard)
  unfollow(
    @Body(new ZodValidationPipe(followSlugSchema)) body: FollowSlugDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.follows.unfollow(body.slug, user);
  }
}
