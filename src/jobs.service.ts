import { Injectable, OnModuleInit } from '@nestjs/common'
import { join } from 'path'

@Injectable()
export class JobsService implements OnModuleInit {
  onModuleInit() {
    if (process.env.JOBS !== 'on') return
    require(join(process.cwd(), 'http-app')).startJobs()
  }
}
