import { PaginationQueryDto } from '../../../commons/dto/pagination.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ContractType, ContractStatus } from '../entities/contract.entity'

export class ContractQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por código' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number

  @ApiPropertyOptional({ description: 'Filtrar por tipo', enum: ContractType })
  @IsOptional()
  @IsEnum(ContractType)
  type?: ContractType

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: ContractStatus,
  })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus
}

export class CreateContractDto {
  @ApiPropertyOptional({ description: 'Tipo do contrato', enum: ContractType })
  @IsEnum(ContractType)
  type: ContractType

  @ApiPropertyOptional({
    description: 'Permite hora extra (0 = não, 1 = sim)',
    default: 0,
    enum: [0, 1],
  })
  @IsOptional()
  @IsNumber()
  @IsEnum([0, 1])
  allowsOvertime?: number

  @ApiPropertyOptional({ description: 'Horas mensais', example: 220 })
  @IsNumber()
  @Min(0)
  monthlyHours: number
}

export class UpdateContractDto {
  @ApiPropertyOptional({ description: 'Tipo do contrato', enum: ContractType })
  @IsOptional()
  @IsEnum(ContractType)
  type?: ContractType

  @ApiPropertyOptional({
    description: 'Estado do contrato',
    enum: ContractStatus,
  })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus

  @ApiPropertyOptional({
    description: 'Permite hora extra (0 = não, 1 = sim)',
    enum: [0, 1],
  })
  @IsOptional()
  @IsNumber()
  @IsEnum([0, 1])
  allowsOvertime?: number

  @ApiPropertyOptional({ description: 'Horas mensais', example: 220 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyHours?: number
}
