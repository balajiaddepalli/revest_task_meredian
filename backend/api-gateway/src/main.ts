import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MicroserviceExceptionFilter } from './common/microservice-exception.filter';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3005', 'http://localhost:3006'],
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new MicroserviceExceptionFilter());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Meridian E-Commerce API')
    .setDescription('REST API for the Meridian customer and admin storefronts. All routes are prefixed with `/api`.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Service health')
    .addTag('auth', 'Registration and login')
    .addTag('products', 'Product catalog')
    .addTag('categories', 'Product categories')
    .addTag('orders', 'Order management')
    .addTag('users', 'User profiles')
    .addTag('cart', 'Shopping cart and checkout')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
