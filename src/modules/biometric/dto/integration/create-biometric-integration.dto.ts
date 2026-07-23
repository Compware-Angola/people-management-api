import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class CreateBiometricIntegrationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  employeeId: number

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  equipmentId: number

  @ApiProperty({ example: 'ENTRADA', enum: ['ENTRADA', 'SAIDA', 'INTERVALO'] })
  @IsEnum(['ENTRADA', 'SAIDA', 'INTERVALO'])
  @IsNotEmpty()
  event: string

  @ApiPropertyOptional({ example: 1, description: '0 = INATIVO, 1 = ATIVO' })
  @IsOptional()
  @IsNumber()
  status?: number
}
