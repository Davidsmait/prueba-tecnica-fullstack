import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupApp(app: INestApplication) {
  const config = app.get(ConfigService);
  app.enableCors({ origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000').split(',') });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
}
