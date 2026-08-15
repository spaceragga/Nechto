import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';
import { env } from './config/env';
import { JsonLogger } from './observability/json-logger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(new JsonLogger());
  const logger = new Logger('Bootstrap');
  configureApp(app);

  if (env.STORAGE_DRIVER === 'local') {
    const uploadsRoot = resolve(env.STORAGE_LOCAL_ROOT);
    await mkdir(uploadsRoot, { recursive: true });
    app.useStaticAssets(uploadsRoot, { prefix: '/uploads/' });
  }

  await app.listen(env.PORT);
  logger.log(`API listening on http://0.0.0.0:${env.PORT}`);
}

void bootstrap();
