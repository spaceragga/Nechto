import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Profile, UpdateProfileDto } from '@nechto/api-contract';
import { isUniqueConstraintError } from '../prisma/is-unique-constraint-error';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { assertAvatarFile, extensionForAvatarMime } from './avatar-file';
import { toProfileView } from './profile.mapper';

export type ProfileView = Profile;

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getMine(userId: string): Promise<ProfileView> {
    const profile = await this.ensureProfile(userId);
    return toProfileView(profile, this.storage);
  }

  async getByUserId(userId: string): Promise<ProfileView> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return toProfileView(profile, this.storage);
  }

  async updateMine(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileView> {
    await this.ensureProfile(userId);

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...(dto.displayName !== undefined
          ? { displayName: dto.displayName }
          : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
      },
      include: { user: { select: { email: true } } },
    });

    return toProfileView(profile, this.storage);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<ProfileView> {
    const avatar = assertAvatarFile(file);
    const profile = await this.ensureProfile(userId);
    const previousKey = profile.avatarKey;
    const key = `avatars/${userId}/${randomUUID()}${extensionForAvatarMime(avatar.mimetype)}`;

    await this.storage.put({
      key,
      body: avatar.buffer,
      contentType: avatar.mimetype,
    });

    // Persist the new key before deleting the old object so a crash cannot leave
    // the DB pointing at a deleted file.
    const updated = await this.prisma.profile.update({
      where: { userId },
      data: { avatarKey: key },
      include: { user: { select: { email: true } } },
    });

    if (previousKey && previousKey !== key) {
      try {
        await this.storage.delete(previousKey);
      } catch (error) {
        this.logger.warn(
          `Failed to delete previous avatar key ${previousKey}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return toProfileView(updated, this.storage);
  }

  private async ensureProfile(userId: string) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });

    if (existing) {
      return existing;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      return await this.prisma.profile.create({
        data: { userId },
        include: { user: { select: { email: true } } },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const raced = await this.prisma.profile.findUnique({
          where: { userId },
          include: { user: { select: { email: true } } },
        });
        if (raced) {
          return raced;
        }
      }
      throw error;
    }
  }
}
