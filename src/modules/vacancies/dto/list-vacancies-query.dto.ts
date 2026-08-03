import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

export class ListVacanciesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Termo de busca pelo código da vaga',
    example: 'VAG-2026-000001',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filtrar por cargo',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  positionId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por departamento',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de contratação',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hiringTypeId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por estado da vaga',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stateId?: number

  @ApiPropertyOptional({
    description: 'Data inicial do período de publicação (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  publicationStart?: string

  @ApiPropertyOptional({
    description: 'Data final do período de publicação (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  publicationEnd?: string

  @ApiPropertyOptional({
    description: 'Data inicial do período de encerramento (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  closingStart?: string

  @ApiPropertyOptional({
    description: 'Data final do período de encerramento (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  closingEnd?: string
}
