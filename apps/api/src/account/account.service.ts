import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { API_ERROR_CODES, type DeleteAccountDto } from '@nechto/api-contract';
import * as bcrypt from 'bcryptjs';
import { ApiHttpException } from '../common/errors/api-http-exception';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ProfilesService,
    private readonly storage: StorageService,
  ) {}

  async suspend(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { suspendedAt: new Date() },
    });
    return this.profiles.getMine(userId);
  }

  async restore(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { suspendedAt: null },
    });
    return this.profiles.getMine(userId);
  }

  async delete(userId: string, dto: DeleteAccountDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordHash: true,
        profile: {
          select: {
            avatarKey: true,
            works: { select: { imageKey: true } },
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new ApiHttpException(
        HttpStatus.UNAUTHORIZED,
        API_ERROR_CODES.CURRENT_PASSWORD_INVALID,
        'Current password is incorrect',
      );
    }

    const keys = [
      user.profile?.avatarKey,
      ...(user.profile?.works.map((work) => work.imageKey) ?? []),
    ].filter((key): key is string => Boolean(key));

    await this.prisma.user.delete({ where: { id: userId } });
    await Promise.all(
      keys.map(async (key) => {
        try {
          await this.storage.delete(key);
        } catch (error) {
          this.logger.warn(
            `Failed to delete account storage key ${key}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }),
    );
  }
}
