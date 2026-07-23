import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsString,
  Length,
  MinLength,
} from 'class-validator'

export class PersonalDto {
  @ApiProperty({
    example: 'Domingos Canhanga',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(3, {
    message: 'Nome completo é obrigatório',
  })
  declare fullName: string

  @ApiProperty({
    example: 2,
    description: 'ID do estado civil',
  })
  @Type(() => Number)
  @IsInt()
  declare maritalStatus: number

  @ApiProperty({
    example: 1,
    description: 'ID do género',
  })
  @Type(() => Number)
  @IsInt()
  declare gender: number

  @ApiProperty({
    example: '1995-05-20',
  })
  @IsDateString()
  declare birthDate: string

  @ApiProperty({
    example: 1,
    description: 'Tipo de documento',
  })
  @Type(() => Number)
  @IsInt()
  declare documentType: number

  @ApiProperty({
    example: '123456789LA',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(3, 30)
  declare documentNumber: string

  @ApiProperty({
    example: '2030-12-30',
  })
  @IsDateString()
  declare documentExpiration: string

  @ApiProperty({
    example: 22,
    description: 'ID da nacionalidade',
  })
  @Type(() => Number)
  @IsInt()
  declare nationality: number

  @ApiProperty({
    example: '924583466',
  })
  @IsString()
  @Length(9, 15)
  declare phone: string

  @ApiProperty({
    example: '',
    required: false,
  })
  @Transform(({ value }) => value || '')
  @IsString()
  declare alternativePhone: string

  @ApiProperty({
    example: 'canhanga96@gmail.com',
  })
  @IsEmail()
  declare email: string

  @ApiProperty({
    example: 'Maianga, Luanda',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(5)
  declare address: string
}
