export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type StoredObject = {
  key: string;
  contentType: string;
  size: number;
};

/**
 * Storage backend contract. Production uses local disk (hoster.by).
 * Keep upload callers on this interface so the backend can change
 * without touching profile/upload modules.
 */
export abstract class StorageService {
  abstract put(input: PutObjectInput): Promise<StoredObject>;
  abstract delete(key: string): Promise<void>;
  abstract getPublicUrl(key: string): string;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
