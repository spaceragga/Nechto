import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { AVATAR_ALLOWED_MIME_TYPES, AVATAR_MAX_BYTES } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { UpdateProfileDto } from './dto/profile.dto';

export type ProfileView = {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

@Injectable()
export class ProfilesService {
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
    const extension = this.extensionForMime(file.mimetype);
    const key = `avatars/${userId}/${randomUUID()}${extension}`;

    await this.storage.put({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    if (profile.avatarKey) {
      await this.storage.delete(profile.avatarKey);
    }

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: { avatarKey: key },
      include: { user: { select: { email: true } } },
    });

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

    return this.prisma.profile.create({
      data: { userId },
      include: { user: { select: { email: true } } },
    });
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
