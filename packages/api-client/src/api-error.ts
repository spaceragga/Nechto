import {
  API_ERROR_CODES,
  type ApiErrorCode,
  type ApiErrorResponse,
  type ApiFieldError,
} from '@nechto/api-contract';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly errors: ApiFieldError[] | undefined;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode = API_ERROR_CODES.UNKNOWN,
    errors?: ApiFieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export async function parseApiErrorResponse(
  response: Response,
): Promise<Pick<ApiErrorResponse, 'code' | 'message' | 'errors'>> {
  try {
    const body = (await response.json()) as Partial<ApiErrorResponse>;
    if (typeof body.message === 'string' && body.message.length > 0) {
      return {
        code: body.code ?? API_ERROR_CODES.UNKNOWN,
        message: body.message,
        errors: body.errors,
      };
    }
  } catch {
    // Fall through to status text.
  }

  return {
    code: API_ERROR_CODES.UNKNOWN,
    message: response.statusText || 'Request failed',
  };
}
