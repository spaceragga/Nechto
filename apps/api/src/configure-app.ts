import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { ApiExceptionFilter } from './common/errors/api-exception.filter';
import { env } from './config/env';

export function configureApp(app: NestExpressApplication): void {
  const accessLogger = new Logger('HttpAccess');
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      // Web (:3000) embeds API upload URLs; Helmet's default same-origin CORP
      // makes <img src="http://localhost:3001/uploads/..."> render as broken.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use((request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const suppliedId = request.header('x-request-id');
    const requestId =
      suppliedId && /^[a-zA-Z0-9._-]{1,100}$/.test(suppliedId)
        ? suppliedId
        : randomUUID();
    response.setHeader('x-request-id', requestId);
    response.on('finish', () => {
      accessLogger.log(
        JSON.stringify({
          requestId,
          method: request.method,
          path: request.path,
          status: response.statusCode,
          durationMs: Date.now() - startedAt,
        }),
      );
    });
    next();
  });
  app.use(cookieParser());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableCors({
    origin: env.CORS_ORIGIN?.split(',').map((value) => value.trim()) ?? true,
    credentials: true,
  });
}
