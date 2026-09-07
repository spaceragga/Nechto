import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@nechto/api-contract';
import { PrismaService } from '../prisma/prisma.service';
import type { StoredObjectBody } from './storage.service';
import { StorageService } from './storage.service';

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async readPublicObject(
    key: string,
    user: AuthUser | null,
  ): Promise<StoredObjectBody | null> {
    if (!isSafeStorageKey(key) || !(await this.canAccess(key, user?.id))) {
      return null;
    }
    return this.storage.read(key);
  }

  private async canAccess(
    key: string,
    requesterId: string | undefined,
  ): Promise<boolean> {
    const avatar = await this.prisma.profile.findFirst({
      where: { avatarKey: key },
      select: {
        publishedAt: true,
        userId: true,
        user: { select: { suspendedAt: true } },
      },
    });
    if (avatar) {
      return isReadable(avatar, requesterId);
    }

    const work = await this.prisma.work.findFirst({
      where: { imageKey: key },
      select: {
        profile: {
          select: {
            publishedAt: true,
            userId: true,
            user: { select: { suspendedAt: true } },
          },
        },
      },
    });
    if (work) {
      return isReadable(work.profile, requesterId);
    }

    return false;
  }
}

type VisibilityRecord = {
  publishedAt: Date | null;
  userId: string;
  user: { suspendedAt: Date | null };
};

function isReadable(
  record: VisibilityRecord,
  requesterId: string | undefined,
): boolean {
  if (requesterId === record.userId) {
    return true;
  }
  return record.publishedAt !== null && record.user.suspendedAt === null;
}

/** Express 5 / path-to-regexp named splats arrive as string[]. */
export function keyFromRouteParam(path: string | string[]): string {
  const joined = Array.isArray(path) ? path.join('/') : path;
  try {
    return decodeURIComponent(joined).replace(/^\/+/, '');
  } catch {
    return '';
  }
}

export function isSafeStorageKey(key: string): boolean {
  return (
    key.length > 0 &&
    key.length <= 240 &&
    !key.includes('..') &&
    !key.startsWith('/') &&
    /^[a-zA-Z0-9._/-]+$/.test(key)
  );
}
