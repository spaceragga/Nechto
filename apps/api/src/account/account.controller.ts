import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  deleteAccountSchema,
  type DeleteAccountDto,
} from '@nechto/api-contract';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { clearAccessTokenCookie } from '../auth/auth-cookies';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AccountService } from './account.service';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('suspend')
  @HttpCode(200)
  suspend(@CurrentUser() user: AuthUser) {
    return this.accountService.suspend(user.id);
  }

  @Post('restore')
  @HttpCode(200)
  restore(@CurrentUser() user: AuthUser) {
    return this.accountService.restore(user.id);
  }

  @Delete()
  @HttpCode(200)
  async delete(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(deleteAccountSchema)) body: DeleteAccountDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.accountService.delete(user.id, body);
    clearAccessTokenCookie(response);
    return { ok: true };
  }
}
