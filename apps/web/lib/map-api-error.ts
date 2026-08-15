import { ApiError } from '@nechto/api-client';

type Translate = (key: string) => string;

const MESSAGE_KEYS: Record<string, string> = {
  'Email is already registered': 'emailTaken',
  'Invalid email or password': 'invalidCredentials',
  'Avatar file is required': 'avatarRequired',
  'Avatar file is too large': 'avatarTooLarge',
  'Avatar must be JPEG, PNG, or WebP': 'avatarType',
  'Profile not found': 'notFound',
  'User not found': 'notFound',
  'Authentication required': 'unauthorized',
};

/** Resolve Errors.* message key from an API failure (no i18n). */
export function resolveApiErrorKey(
  error: unknown,
  fallbackKey = 'unknown',
): string {
  if (error instanceof ApiError) {
    const byMessage = MESSAGE_KEYS[error.message];
    if (byMessage) {
      return byMessage;
    }

    if (error.status === 401) {
      return 'unauthorized';
    }
    if (error.status === 403) {
      return 'forbidden';
    }
    if (error.status === 404) {
      return 'notFound';
    }
    if (error.status === 409) {
      return 'conflict';
    }
    if (error.status === 400) {
      return 'validation';
    }
  }

  return fallbackKey;
}

/**
 * Map API failures to localized copy under the Errors namespace.
 * Prefer stable status + known Nest messages over raw English text in UI.
 */
export function mapApiErrorMessage(
  error: unknown,
  t: Translate,
  fallbackKey = 'unknown',
): string {
  return t(resolveApiErrorKey(error, fallbackKey));
}
