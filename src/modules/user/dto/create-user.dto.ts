import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  bi: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  nif?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  alternativePhone?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  province: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  municipality: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  status?: number
}
