import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CreateHiringTypeDto {
  @ApiProperty({
    description: 'Sigla do tipo de contratação',
    example: 'CTI',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  declare acronym: string

  @ApiProperty({
    description: 'Descrição do tipo de contratação',
    example: 'Contrato por tempo indeterminado',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  declare description: string

  @ApiPropertyOptional({
    description: 'Estado do tipo de contratação (1 = ativo, 0 = inativo)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsIn([0, 1])
  status?: number
}
