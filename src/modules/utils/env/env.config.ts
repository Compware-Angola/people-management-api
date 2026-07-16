import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { loadEnvFile } from './env.loader';
import { EnvValidation } from './env.validation';

loadEnvFile();

function parseEnv(): EnvValidation {
  const env = plainToInstance(EnvValidation, process.env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(env, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `❌ Environment validation failed:\n${errors
        .map((e) => JSON.stringify(e.constraints))
        .join('\n')}`,
    );
  }



  return env;
}

export const env = parseEnv();
