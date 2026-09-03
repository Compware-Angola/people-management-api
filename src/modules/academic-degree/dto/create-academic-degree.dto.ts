import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'

import { AcademicDegreeStatus } from '../entity/academic-degree.entity'

export class CreateAcademicDegreeDto {
  @ApiProperty({
    description: 'Designação do grau académico',
    example: 'Licenciado',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  declare designation: string

  @ApiPropertyOptional({
    description: 'Sigla do grau académico',
    example: 'LIC',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  declare acronym?: string

  @ApiProperty({
    description: 'Ordem utilizada na pontuação do grau académico',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  declare order: number

  @ApiPropertyOptional({
    description: 'Estado do grau académico',
    enum: AcademicDegreeStatus,
    enumName: 'AcademicDegreeStatus',
    example: AcademicDegreeStatus.ACTIVE,
    default: AcademicDegreeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AcademicDegreeStatus)
  declare status?: AcademicDegreeStatus
}
