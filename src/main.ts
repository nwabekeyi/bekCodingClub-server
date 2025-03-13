import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up Swagger config
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description for your application')
    .setVersion('1.0')
    .addBearerAuth()  // Add this if you're using JWT authentication
    .build();

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger module at the /api-docs route
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}

bootstrap();
