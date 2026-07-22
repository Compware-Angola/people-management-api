import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNumber, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { PaginationQueryDto } from '../../../common/dto/pagination.dto'

export class VacationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por código do colaborador' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  employeeId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: ['PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO'],
  })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: 'Filtrar por gestor aprovador' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  approverManagerId?: number

  @ApiPropertyOptional({ description: 'Filtrar por RH aprovador' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  approverRhId?: number

  @ApiPropertyOptional({
    description: 'Data de início (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string

  @ApiPropertyOptional({
    description: 'Data de fim (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string
}
