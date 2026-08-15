import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type { Profile, UpdateProfileDto } from '@nechto/api-contract';
import { AVATAR_ALLOWED_MIME_TYPES, AVATAR_MAX_BYTES } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

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
    return this.toView(profile);
  }

  async getByUserId(userId: string): Promise<ProfileView> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.toView(profile);
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

    return this.toView(profile);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<ProfileView> {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    if (file.size > AVATAR_MAX_BYTES) {
      throw new BadRequestException('Avatar file is too large');
    }

    if (
      !AVATAR_ALLOWED_MIME_TYPES.includes(
        file.mimetype as (typeof AVATAR_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException('Avatar must be JPEG, PNG, or WebP');
    }

    const profile = await this.ensureProfile(userId);
    const previousKey = profile.avatarKey;
    const extension = this.extensionForMime(file.mimetype);
    const key = `avatars/${userId}/${randomUUID()}${extension}`;

    await this.storage.put({
      key,
      body: file.buffer,
      contentType: file.mimetype,
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

    return this.toView(updated);
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
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

  private toView(profile: {
    id: string;
    userId: string;
    displayName: string | null;
    bio: string | null;
    avatarKey: string | null;
    user: { email: string };
  }): ProfileView {
    return {
      id: profile.id,
      userId: profile.userId,
      email: profile.user.email,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarKey
        ? this.storage.getPublicUrl(profile.avatarKey)
        : null,
    };
  }

  private extensionForMime(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      default:
        return extname(mimeType) || '.bin';
    }
  }
}
