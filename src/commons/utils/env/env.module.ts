import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

import { getEnvFilePath } from './env.loader'
import { EnvService } from './env.service'
import { EnvValidation } from './env.validation'

export function validateEnv(config: Record<string, any>): Record<string, any> {
  const env = plainToInstance(EnvValidation, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(env, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(
      `❌ Environment validation failed:\n${errors
        .map((e) => JSON.stringify(e.constraints))
        .join('\n')}`,
    )
  }

  return env
}
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: getEnvFilePath(),
      validate: validateEnv,
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
