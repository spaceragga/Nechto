import { ApiError } from '@nechto/api-client';
import { API_ERROR_CODES, type ApiErrorCode } from '@nechto/api-contract';

type Translate = (key: string) => string;

const CODE_KEYS: Partial<Record<ApiErrorCode, string>> = {
  [API_ERROR_CODES.EMAIL_TAKEN]: 'emailTaken',
  [API_ERROR_CODES.SLUG_TAKEN]: 'slugTaken',
  [API_ERROR_CODES.PUBLISH_REQUIREMENTS_NOT_MET]: 'publishRequirements',
  [API_ERROR_CODES.INVALID_CREDENTIALS]: 'invalidCredentials',
  [API_ERROR_CODES.AVATAR_REQUIRED]: 'avatarRequired',
  [API_ERROR_CODES.AVATAR_TOO_LARGE]: 'avatarTooLarge',
  [API_ERROR_CODES.AVATAR_INVALID_TYPE]: 'avatarType',
  [API_ERROR_CODES.PROFILE_NOT_FOUND]: 'notFound',
  [API_ERROR_CODES.USER_NOT_FOUND]: 'notFound',
  [API_ERROR_CODES.AUTHENTICATION_REQUIRED]: 'unauthorized',
  [API_ERROR_CODES.FORBIDDEN]: 'forbidden',
  [API_ERROR_CODES.VALIDATION_FAILED]: 'validation',
  [API_ERROR_CODES.RATE_LIMITED]: 'rateLimited',
  [API_ERROR_CODES.SERVICE_UNAVAILABLE]: 'serviceUnavailable',
};

/** Resolve Errors.* message key from an API failure (no i18n). */
export function resolveApiErrorKey(
  error: unknown,
  fallbackKey = 'unknown',
): string {
  if (error instanceof ApiError) {
    const byCode = CODE_KEYS[error.code];
    if (byCode) {
      return byCode;
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
    if (error.status === 0 || error.status >= 500) {
      return 'serviceUnavailable';
    }

    return fallbackKey;
  }

  return 'serviceUnavailable';
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

/** Login/register: 401 is always a credential mismatch, not "please sign in". */
export function mapAuthFormError(error: unknown, t: Translate): string {
  if (error instanceof ApiError && error.status === 401) {
    return t('invalidCredentials');
  }

  return mapApiErrorMessage(error, t);
}
