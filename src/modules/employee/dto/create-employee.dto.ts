import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CreateEmployeeDto {
  @ApiProperty({ example: 1, description: 'ID do usuário já cadastrado' })
  @IsNumber()
  @IsNotEmpty()
  userId: number

  @ApiProperty({ example: 'BFA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bank: string

  @ApiProperty({ example: 'AO06000000000000000000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(34)
  iban: string

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  accountHolder: string

  @ApiProperty({ example: 'AOA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  currency: string

  @ApiPropertyOptional({ example: 1, description: '0 = INATIVO, 1 = ATIVO' })
  @IsOptional()
  @IsNumber()
  status?: number
}
