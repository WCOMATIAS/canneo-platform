import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 4000);
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Security middlewares
  app.use(helmet());
  app.use(cookieParser());

  // CORS
  const corsOrigins = configService.get<string>('API_CORS_ORIGINS', '')
    .split(',')
    .filter(Boolean);

  app.enableCors({
    origin: isProduction ? corsOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CANNEO API')
      .setDescription('API de Telemedicina CANNEO')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addCookieAuth('canneo_access')
      .addTag('Auth', 'Autenticação e autorização')
      .addTag('Users', 'Gerenciamento de usuários')
      .addTag('Doctors', 'Gerenciamento de médicos')
      .addTag('Patients', 'Gerenciamento de pacientes')
      .addTag('Appointments', 'Agendamentos e consultas')
      .addTag('Prescriptions', 'Prescrições médicas')
      .addTag('Payments', 'Pagamentos e carteiras')
      .addTag('Orders', 'Pedidos de farmácia')
      .addTag('Pharmacy', 'Gerenciamento de farmácias')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`Swagger documentation available at /docs`);
  }

  await app.listen(port);
  logger.log(`CANNEO API running on port ${port}`);
  logger.log(`Environment: ${isProduction ? 'production' : 'development'}`);
}

bootstrap();
