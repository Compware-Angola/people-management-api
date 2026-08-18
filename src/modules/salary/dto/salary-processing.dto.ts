import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { PaginationQueryDto } from '../../../commons/dto/pagination.dto'
import { SalaryProcessingStatus } from '../entities/salary-processing.entity'

export class CreateSalaryProcessingDto {
  @ApiProperty({
    description: 'Data de início do período',
    example: '2026-07-01',
  })
  @IsDateString()
  startDate: string

  @ApiProperty({ description: 'Data de fim do período', example: '2026-07-31' })
  @IsDateString()
  endDate: string
}

export enum SalaryProcessingValidationStatus {
  CLOSED = 'FECHADO',
  REJECTED = 'RECUSADO',
}

export class ValidateSalaryProcessingDto {
  @ApiProperty({ enum: SalaryProcessingValidationStatus })
  @IsEnum(SalaryProcessingValidationStatus)
  status: SalaryProcessingValidationStatus
}

export class SalaryProcessingQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por código' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: SalaryProcessingStatus,
  })
  @IsOptional()
  @IsEnum(SalaryProcessingStatus)
  status?: SalaryProcessingStatus

  @ApiPropertyOptional({
    description: 'Filtrar por código do colaborador responsável',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  responsibleEmployeeId?: number

  @ApiPropertyOptional({
    description: 'Início do período (a partir de)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    description: 'Fim do período (até)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string
}
