import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // class validationを使うため
import { Request } from 'express'; // express のデータ型
import * as cookieParser from 'cookie-parser'; // cookieを扱うため必要
import * as csurf from 'csurf'; // csrf tokenを使用するため

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //class-validationを有効化する
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  //corsを許可するフロントエンドのドメインを設定
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000'],
  });

  // cookieを取り扱う
  app.use(cookieParser());
  await app.listen(5000);
}
bootstrap();
