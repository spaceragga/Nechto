import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter,
} from '@nestjs/common';
import {
  API_ERROR_CODES,
  type ApiErrorCode,
  type ApiErrorResponse,
  type ApiFieldError,
} from '@nechto/api-contract';
import type { Response } from 'express';

type ExceptionBody = {
  code?: ApiErrorCode;
  message?: string | string[];
  errors?: ApiFieldError[];
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionBody =
      exception instanceof HttpException
        ? this.toExceptionBody(exception.getResponse())
        : {};

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        'Unhandled API exception',
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ApiErrorResponse = {
      statusCode: status,
      code: exceptionBody.code ?? this.defaultCodeForStatus(status),
      message: this.messageForResponse(status, exceptionBody.message),
      ...(exceptionBody.errors ? { errors: exceptionBody.errors } : {}),
    };

    response.status(status).json(body);
  }

  private toExceptionBody(response: string | object): ExceptionBody {
    if (typeof response === 'string') {
      return { message: response };
    }
    return response as ExceptionBody;
  }

  private messageForResponse(
    status: number,
    message: string | string[] | undefined,
  ): string {
    if (Array.isArray(message)) {
      return message.join('; ');
    }
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
    return status >= 500 ? 'Internal server error' : 'Request failed';
  }

  private defaultCodeForStatus(status: number): ApiErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return API_ERROR_CODES.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return API_ERROR_CODES.AUTHENTICATION_REQUIRED;
      case HttpStatus.FORBIDDEN:
        return API_ERROR_CODES.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return API_ERROR_CODES.NOT_FOUND;
      case HttpStatus.PAYLOAD_TOO_LARGE:
        return API_ERROR_CODES.AVATAR_TOO_LARGE;
      case HttpStatus.UNSUPPORTED_MEDIA_TYPE:
        return API_ERROR_CODES.AVATAR_INVALID_TYPE;
      case HttpStatus.TOO_MANY_REQUESTS:
        return API_ERROR_CODES.RATE_LIMITED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return API_ERROR_CODES.SERVICE_UNAVAILABLE;
      default:
        return API_ERROR_CODES.UNKNOWN;
    }
  }
}
