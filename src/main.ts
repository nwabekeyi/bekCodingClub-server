import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static assets from the public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Middleware to handle CORS and OPTIONS requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = ['http://127.0.0.1:5500','http://127.0.0.1:5502', 'http://127.0.0.1:5501', 'https://beks-coding-club-foundation-track.vercel.app', 'https://beks-coding-club-foundation-track-l0i56pp58.vercel.app/'];
    const origin = req.headers.origin as string;
  
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }
  });

  app.enableCors({
    origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:5501', 'https://beks-coding-club-foundation-track.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });
  

  // API Documentation setup
  const config = new DocumentBuilder()
    .setTitle('Beks Coding Club')
    .setDescription('API documentation description for beks community foundation track')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearerAuth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Use Express-style route definitions with proper typing
  const expressApp = app.getHttpAdapter().getInstance(); // Get the underlying Express app
  expressApp.get('/passwordreset/token', (req: Request, res: Response) => {
    res.sendFile(join(process.cwd(), 'src/public/auth/registrationForm.html'));
  });

  expressApp.get('/auth/register', (req: Request, res: Response) => {
    res.sendFile(join(process.cwd(), 'src/public/auth/registrationForm.html'));
  });

  expressApp.get('/signup/confirm', (req: Request, res: Response) => {
    res.sendFile(join(process.cwd(), 'src/public/auth/registrationForm.html'));
  });


  await app.listen(3000);
  console.log('Server listening on http://localhost:3000');
}

bootstrap();
