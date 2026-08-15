import { HttpException, type HttpStatus } from '@nestjs/common';
import type { ApiErrorCode, ApiFieldError } from '@nechto/api-contract';

export class ApiHttpException extends HttpException {
  constructor(
    status: HttpStatus,
    code: ApiErrorCode,
    message: string,
    errors?: ApiFieldError[],
  ) {
    super(
      {
        statusCode: status,
        code,
        message,
        ...(errors ? { errors } : {}),
      },
      status,
    );
  }
}
