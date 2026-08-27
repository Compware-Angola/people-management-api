import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'

import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

import { VacancyRequestTypeStatus } from '../entity/vacancy-request-type.entity'

export class ListVacancyRequestTypeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Texto para pesquisar pela sigla ou descrição',
    example: 'DOC',
  })
  @IsOptional()
  @IsString()
  declare search?: string

  @ApiPropertyOptional({
    description: 'Filtrar pelo estado',
    enum: VacancyRequestTypeStatus,
    enumName: 'VacancyRequestTypeStatus',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(VacancyRequestTypeStatus)
  declare status?: VacancyRequestTypeStatus
}
