import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
  // ─── Logger ──────────────────────────────────────────────────────
  const lokiUrl = process.env.LOKI_URL;
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context }) =>
          `[${timestamp}] ${level} [${context ?? 'App'}]: ${message}`,
        ),
      ),
    }),
  ];

  // Only add Loki transport when explicitly configured
  if (lokiUrl) {
    try {
      const lokiParsed = new URL(lokiUrl);
      transports.push(
        new winston.transports.Http({
          host: lokiParsed.hostname,
          port: Number(lokiParsed.port) || 3100,
          path: '/loki/api/v1/push',
        }),
      );
    } catch {
      // ignore invalid LOKI_URL
    }
  }

  const logger = WinstonModule.createLogger({ transports });

  const app = await NestFactory.create(AppModule, { logger });
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 4000);
  const isDev = config.get('NODE_ENV') !== 'production';

  // ─── Security ────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: !isDev,
    crossOriginEmbedderPolicy: !isDev,
  }));
  app.use(compression());
  app.use(cookieParser());

  // ─── CORS ────────────────────────────────────────────────────────
  app.enableCors({
    origin: config.get('APP_URL', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ─── API Versioning ──────────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ─── Validation ──────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger ─────────────────────────────────────────────────────
  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Hikely API')
      .setDescription('Hikely — Plateforme collaborative de randonnée')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentification')
      .addTag('hikes', 'Randonnées')
      .addTag('users', 'Utilisateurs')
      .addTag('reviews', 'Avis')
      .addTag('search', 'Recherche')
      .addTag('admin', 'Administration')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  logger.log(`🏔️  Hikely API running on http://localhost:${port}/api/v1`, 'Bootstrap');
  logger.log(`📖 Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
