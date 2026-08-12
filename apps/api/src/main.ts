import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: env.CORS_ORIGIN?.split(',').map((value) => value.trim()) ?? true,
  });

  await app.listen(env.PORT);
  console.log(`API listening on http://0.0.0.0:${env.PORT}`);
}

void bootstrap();
