import { join } from 'path'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import express from 'express'
import { AppModule } from './app.module'

async function bootstrap() {
  process.env.APP_ENV = process.env.APP_ENV || 'staging'
  const server = express()
  require(join(process.cwd(), 'http-app')).mount(server)

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: false,
  })
  const port = Number(process.env.PORT || 8090)
  await app.listen(port)
  console.log(`BaytiHub API http://localhost:${port}`)
}

bootstrap()
