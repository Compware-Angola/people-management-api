import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export enum LeaveType {
  MEDICAL = 'MEDICA',
  MATERNITY = 'MATERNIDADE',
  PATERNITY = 'PATERNIDADE',
  STUDY = 'ESTUDO',
}

export class CreateLeaveDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  employeeId: number

  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  type: LeaveType

  @ApiProperty({ example: '2026-07-23' })
  @IsDateString()
  startDate: string

  @ApiProperty({ example: '2026-07-30' })
  @IsDateString()
  endDate: string

  @ApiPropertyOptional({ example: 101 })
  @IsInt()
  @IsOptional()
  documentId?: number

  @ApiPropertyOptional({ example: 'Licença por motivo de saúde' })
  @IsString()
  @IsOptional()
  observation?: string
}
