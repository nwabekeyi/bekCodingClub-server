import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up Swagger config
  const config = new DocumentBuilder()
    .setTitle('Beks Coding Club API Documentation')
    .setDescription('Beks Coding Club app API documentation. if you need any help understanding this, please contact Mr. Chidiebere')
    .setVersion('1.0')
    .addBearerAuth( // Add Bearer token authentication
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Optional: specify token format
      },
      'bearerAuth' // Name of the security scheme
    )    .build();

  // Create Swagger document  
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger module at the /api-docs route
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}

bootstrap();
