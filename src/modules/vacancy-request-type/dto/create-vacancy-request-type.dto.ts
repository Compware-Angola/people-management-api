import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'

import { VacancyRequestTypeStatus } from '../entity/vacancy-request-type.entity'

export class CreateVacancyRequestTypeDto {
  @ApiProperty({
    description: 'Sigla do tipo de requisição',
    example: 'DOC',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @Matches(/^[A-Za-z0-9]{3}$/, {
    message: 'A sigla deve conter exatamente 3 caracteres alfanuméricos',
  })
  declare acronym: string

  @ApiProperty({
    description: 'Descrição do tipo de requisição de vaga',
    example: 'Vaga docente',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  declare description: string

  @ApiProperty({
    description: 'Estado do tipo de requisição',
    enum: VacancyRequestTypeStatus,
    enumName: 'VacancyRequestTypeStatus',
    example: VacancyRequestTypeStatus.ACTIVE,
    required: false,
    default: VacancyRequestTypeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(VacancyRequestTypeStatus)
  declare status?: VacancyRequestTypeStatus
}
