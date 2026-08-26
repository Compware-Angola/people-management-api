import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

export class ListRequisitionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Termo de busca pelo código da requisição',
    example: 'REQ-2026-000001',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Termo de busca pelo nome do solicitante',
    example: 'João',
  })
  @IsOptional()
  @IsString()
  requesterName?: string

  @ApiPropertyOptional({
    description: 'Filtrar por código do solicitante',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  requesterId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por departamento',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por centro de custo',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  costCenterId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por cargo',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  positionId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de contratação',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hiringTypeId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por estado da requisição',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stateId?: number

  @ApiPropertyOptional({
    description: 'Data inicial do período da solicitação (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    description: 'Data final do período da solicitação (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string
  @ApiPropertyOptional({
    description: 'Filtrar por estado da requisição',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vacancyRequestTypeId?: number
}
