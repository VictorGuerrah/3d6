import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { useContainer } from 'class-validator'
import type { INestApplication } from '@nestjs/common'
import type { Express } from 'express'
import { AppModule } from './app.module'

function getCorsOptions() {
  const raw = process.env.CORS_ORIGIN

  if (!raw || raw.trim() === '*') {
    return { origin: '*', credentials: false }
  }

  const origins = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

  return { origin: origins, credentials: true }
}

export async function createNestApp(expressApp?: Express): Promise<INestApplication> {
  const app = expressApp
    ? await NestFactory.create(AppModule, new ExpressAdapter(expressApp))
    : await NestFactory.create(AppModule)

  app.enableCors(getCorsOptions())

  const config = new DocumentBuilder()
    .setTitle('3d6')
    .setDescription('The 3d6 API description')
    .setVersion('1.0')
    .addTag('3d6')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.init()
  return app
}
