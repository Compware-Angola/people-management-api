import { Type } from 'class-transformer'
import {
  IsBooleanString,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator'

export class EnvValidation {
  @IsEnum(['development', 'production', 'test', 'staging'])
  NODE_ENV: 'development' | 'production' | 'test' | 'staging' = 'development'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  PORT: number = 3000

  @IsString()
  DB_HOST: string

  @Type(() => Number)
  @IsNumber()
  DB_PORT: number

  @IsString()
  DB_USERNAME: string

  @IsString()
  DB_PASSWORD: string

  @IsOptional()
  @IsString()
  DB_SERVICE?: string

  @IsOptional()
  @IsString()
  DB_SID?: string

  @IsOptional()
  @IsBooleanString()
  DB_SSL?: string = 'false'

  @IsString()
  HASH_SERVICE_URL: string;

  @IsString()
  MAIL_API_URL: string;

  @IsString()
  PORTAL_CANDIDATE_URL: string;
}
