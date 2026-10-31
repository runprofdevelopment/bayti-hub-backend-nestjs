require('reflect-metadata')

const { join } = require('path')
const express = require('express')
const { NestFactory } = require('@nestjs/core')
const { ExpressAdapter } = require('@nestjs/platform-express')

class JobsService {
  onModuleInit() {
    if (process.env.JOBS !== 'on') return
    require(join(process.cwd(), 'http-app')).startJobs()
  }
}

class AppModule {}

Reflect.defineMetadata('imports', [], AppModule)
Reflect.defineMetadata('controllers', [], AppModule)
Reflect.defineMetadata('providers', [JobsService], AppModule)
Reflect.defineMetadata('exports', [], AppModule)

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
