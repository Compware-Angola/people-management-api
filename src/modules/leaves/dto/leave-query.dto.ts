import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { PaginationQueryDto } from '../../../commons/dto/pagination.dto'
import { LeaveType } from './create-leave.dto'
import { LeaveStatus } from './update-leave.dto'

export class LeaveQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por código do colaborador' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  employeeId?: number

  @ApiPropertyOptional({
    description: 'Filtrar por tipo',
    enum: LeaveType,
  })
  @IsOptional()
  @IsEnum(LeaveType)
  type?: LeaveType

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: LeaveStatus,
  })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus

  @ApiPropertyOptional({
    description: 'Data de início do período (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string

  @ApiPropertyOptional({
    description: 'Data de fim do período (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string
}
