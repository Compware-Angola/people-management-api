import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateEmployeeDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  name: string

  @ApiProperty({
    example: '003093887BE035',
    description: 'Bilhete de Identidade',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^[A-Z0-9]+$/i, {
    message: 'bi deve conter apenas letras e números',
  })
  bi: string

  @ApiPropertyOptional({
    example: '5001234567',
    description: 'Número de Identificação Fiscal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nif?: string

  @ApiProperty({ example: '923123456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string

  @ApiPropertyOptional({ example: '912345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  alternativePhone?: string

  @ApiProperty({ example: 'Luanda' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  province: string

  @ApiProperty({ example: 'Cazenga' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  municipality: string

  @ApiProperty({ example: 'Rua 1, Casa 2' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address: string

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string

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
