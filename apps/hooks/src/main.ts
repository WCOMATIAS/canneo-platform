import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('HooksBootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Necessário para verificação de assinatura
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('HOOKS_PORT', 4001);
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Security
  app.use(helmet());

  // CORS limitado - apenas PSPs e serviços conhecidos
  app.enableCors({
    origin: isProduction
      ? [
          'https://api.daily.co',
          'https://api.stripe.com',
          'https://api.melhorenvio.com.br',
        ]
      : true,
    credentials: false,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefix
  app.setGlobalPrefix('webhooks');

  await app.listen(port);
  logger.log(`CANNEO Hooks service running on port ${port}`);
  logger.log(`Environment: ${isProduction ? 'production' : 'development'}`);
}

bootstrap();
