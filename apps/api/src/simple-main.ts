import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SimpleAppModule } from './app/simple-app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(SimpleAppModule);
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS for development
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Simple Auth Server running on: http://localhost:${port}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /auth/register - Register new user`);
  console.log(`   POST /auth/login - Login user`);
  console.log(`   GET /auth/profile - Get user profile (protected)`);
  console.log(`   POST /auth/refresh - Refresh token (protected)`);
  console.log(`   GET / - Health check`);
}

bootstrap();
