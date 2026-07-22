import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

export class CreateUserDto {
  @ApiProperty({
    example: 'Domingos Canhanga',
    description: 'User full name',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  declare name: string

  @ApiProperty({
    example: '123456789LA045',
    description: 'Identity card number',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  declare bi: string

  @ApiProperty({
    example: '+244923000000',
  })
  @IsString()
  @IsNotEmpty()
  declare phone: string

  @ApiPropertyOptional({
    example: '+244924000000',
  })
  @IsOptional()
  @IsString()
  alternativePhone?: string

  @ApiProperty({
    example: 'Luanda',
  })
  @IsString()
  @IsNotEmpty()
  declare province: string

  @ApiProperty({
    example: 'Cazenga',
  })
  @IsString()
  @IsNotEmpty()
  declare municipality: string

  @ApiProperty({
    example: 'Rua Principal Nº 10',
  })
  @IsString()
  @IsNotEmpty()
  declare address: string

  @ApiProperty({
    example: 'domingos@email.com',
  })
  @IsEmail()
  declare email: string
}
