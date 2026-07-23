import path from 'node:path'
import { DataSourceOptions } from 'typeorm'
import { env } from './env/env.config'

const isDevelopment = env.NODE_ENV === 'development'
const isTest = env.NODE_ENV === 'test'

const rootDir = process.cwd()
const isTsNode = __filename.endsWith('.ts')

const baseDir = isTsNode ? 'src' : 'dist'
const extension = isTsNode ? 'ts' : 'js'
const isSSL = env.DB_SSL === 'true'

export const typeOrmConfig: DataSourceOptions = {
  type: 'oracle',

  entities: [path.join(rootDir, baseDir, `/**/*.entity.${extension}`)],

  migrations: [path.join(rootDir, baseDir, `/**/migrations/*.${extension}`)],

  migrationsTableName: 'migrations',

  synchronize: false,
  dropSchema: false,

  logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],

  logger: 'advanced-console',

  maxQueryExecutionTime: 3000,

  poolSize: isDevelopment ? 5 : 20,

  useUTC: true,

  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  sid: env.DB_SID ?? undefined,
  serviceName: env.DB_SERVICE,

  extra: {
    poolMin: 5,
    poolMax: 30,
    poolIncrement: 5,
    queueTimeout: 120000,
    queueMax: 100,
    poolTimeout: 60,
    poolPingInterval: 60,
    connectTimeout: 15000,
    ...(isSSL ? { ssl: { rejectUnauthorized: true } } : {}),
  },
}
