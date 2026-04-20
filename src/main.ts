import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3001);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use(
    '/UplodedOrderFiles',
    express.static(join(process.cwd(), 'UplodedOrderFiles')),
  );

  const config = new DocumentBuilder()
    .setTitle('Backbone Master/Admin API')
    .setDescription(
      'Swagger test surface for master modules aligned to the live Backbone database.',
    )
    .setVersion('2026.04')
    .addServer(`http://localhost:${port}`, 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Bearer',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Backbone Master/Admin API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

await app.listen(port, '0.0.0.0');
  console.log(`Backbone API running on http://localhost:${port}`);
  console.log(`Swagger docs ready at http://localhost:${port}/api`);
}
bootstrap();
