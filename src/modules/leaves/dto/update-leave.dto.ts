import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export enum LeaveStatus {
  PENDING = 'PENDENTE',
  APPROVED = 'APROVADA',
  REJECTED = 'REJEITADA',
  CANCELLED = 'CANCELADA',
}

export class UpdateLeaveDto {
  @ApiProperty({ enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  status: LeaveStatus

  @ApiPropertyOptional({
    example: 2,
    description: 'ID do colaborador aprovador',
  })
  @IsInt()
  @IsOptional()
  approverId?: number

  @ApiPropertyOptional({ example: 'Estado atualizado conforme documentação' })
  @IsString()
  @IsOptional()
  observation?: string
}
