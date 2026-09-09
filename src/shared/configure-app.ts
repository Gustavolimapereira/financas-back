import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './errors/http-exception.filter';

export function configureApp(app: INestApplication): void {
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
