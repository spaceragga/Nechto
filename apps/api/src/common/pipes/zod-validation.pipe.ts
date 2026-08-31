import { ArgumentMetadata, HttpStatus, PipeTransform } from '@nestjs/common';
import { API_ERROR_CODES } from '@nechto/api-contract';
import type { ZodTypeAny } from 'zod';
import { ApiHttpException } from '../errors/api-http-exception';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const input =
      metadata.type === 'query' && (value === undefined || value === null)
        ? {}
        : value;
    const parsed = this.schema.safeParse(input);

    if (!parsed.success) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        API_ERROR_CODES.VALIDATION_FAILED,
        'Validation failed',
        parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
    }

    return parsed.data;
  }
}
