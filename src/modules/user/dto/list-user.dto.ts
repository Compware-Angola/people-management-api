import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'

enum UserStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

export class ListUserDto {
  @ApiPropertyOptional({
    default: 1,
    example: 1,
    description: 'Número da página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'A página deve ser um número inteiro',
  })
  @Min(1, {
    message: 'A página deve ser maior ou igual a 1',
  })
  page?: number
  @ApiPropertyOptional({
    default: 20,
    example: 20,
    description: 'Quantidade de registros por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'O limite deve ser um número inteiro',
  })
  @Min(1, {
    message: 'O limite deve ser maior ou igual a 1',
  })
  limit?: number
  @ApiPropertyOptional({
    example: 'domingos',
    description: 'Pesquisa por nome, email ou BI',
  })
  @IsOptional()
  @IsString({
    message: 'A pesquisa deve ser um texto',
  })
  search?: string

  @ApiPropertyOptional({
    example: 1,
    enum: UserStatus,
    description: 'Estado do usuário: 1 ativo, 0 inativo',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsEnum(UserStatus, {
    message: 'O estado deve ser 1 (ativo) ou 0 (inativo)',
  })
  status?: UserStatus
}
