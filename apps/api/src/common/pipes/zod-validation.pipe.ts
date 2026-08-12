import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import type { ZodTypeAny } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const parsed = this.schema.safeParse(value);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .join('; ');
      throw new BadRequestException(message || 'Validation failed');
    }

    return parsed.data;
  }
}
