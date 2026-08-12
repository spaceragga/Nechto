import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { Injectable } from '@nestjs/common';
import { env } from '../config/env';
import {
  type PutObjectInput,
  type StoredObject,
  StorageService,
} from './storage.service';

@Injectable()
export class LocalDiskStorageService extends StorageService {
  private readonly rootDir = resolve(env.STORAGE_LOCAL_ROOT);

  async put(input: PutObjectInput): Promise<StoredObject> {
    const absolutePath = this.resolveKeyPath(input.key);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.body);

    return {
      key: input.key,
      contentType: input.contentType,
      size: input.body.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    const absolutePath = this.resolveKeyPath(key);

    try {
      await unlink(absolutePath);
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? (error as { code?: string }).code
          : undefined;
      if (code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getPublicUrl(key: string): string {
    const base = env.STORAGE_PUBLIC_BASE_URL.replace(/\/$/, '');
    const normalizedKey = key.replace(/^\/+/, '');
    return `${base}/${normalizedKey}`;
  }

  getRootDir(): string {
    return this.rootDir;
  }

  private resolveKeyPath(key: string): string {
    const normalizedKey = key.replace(/^\/+/, '').replace(/\.\./g, '');
    return join(this.rootDir, normalizedKey);
  }
}
