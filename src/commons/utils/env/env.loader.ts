import fs from 'node:fs'

import * as dotenv from 'dotenv'

export function getEnvFilePath(): string {
  const nodeEnv = process.env.NODE_ENV ?? 'development'

  const map: Record<string, string> = {
    development: '.env.dev',
    staging: '.env.staging',
    test: '.env.test',
    production: '.env.prod',
  }

  const envFile = map[nodeEnv] ?? '.env.prod'

  if (!fs.existsSync(envFile)) {
    throw new Error(`❌ Missing ${envFile} file.`)
  }

  return envFile
}

export function loadEnvFile() {
  const envFile = getEnvFilePath()

  dotenv.config({
    path: envFile,
    override: true,
  })
}
