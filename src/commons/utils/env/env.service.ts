import { Injectable } from '@nestjs/common'

import { env } from './env.config'
import { EnvValidation } from './env.validation'

@Injectable()
export class EnvService {
  get<K extends keyof EnvValidation>(key: K): EnvValidation[K] {
    return env[key]
  }
}
