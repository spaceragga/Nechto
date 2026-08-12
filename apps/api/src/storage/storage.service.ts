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
 * Storage backend contract. Swap local disk for S3-compatible later
 * without changing profile/upload callers.
 */
export abstract class StorageService {
  abstract put(input: PutObjectInput): Promise<StoredObject>;
  abstract delete(key: string): Promise<void>;
  abstract getPublicUrl(key: string): string;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
