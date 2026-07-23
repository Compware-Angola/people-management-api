import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { typeOrmConfig } from './typeorm-config'

export const databaseConfig: TypeOrmModuleOptions = {
  ...typeOrmConfig,
  autoLoadEntities: true,
}
