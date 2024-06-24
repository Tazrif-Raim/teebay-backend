import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: 'j39349ghf93gh934334bth349tbh34th94t',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        maxAge: 3600000
      },
    }),
  );
  app.enableCors({
    origin: true,
    credentials: true
  });
  await app.listen(3000);
}
bootstrap();
