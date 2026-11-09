import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  createCommentSchema,
  listCommentsQuerySchema,
  type AuthUser,
  type CreateCommentDto,
  type ListCommentsQuery,
} from '@nechto/api-contract';
import {
  CurrentUser,
  OptionalUser,
} from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  list(
    @Query(new ZodValidationPipe(listCommentsQuerySchema))
    query: ListCommentsQuery,
    @OptionalUser() user: AuthUser | null,
  ) {
    return this.comments.list(query, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  create(
    @Body(new ZodValidationPipe(createCommentSchema)) body: CreateCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.comments.create(body, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.comments.remove(id, user);
  }
}
