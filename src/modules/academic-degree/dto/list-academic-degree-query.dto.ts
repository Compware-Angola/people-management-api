import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator'

import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

import { AcademicDegreeStatus } from '../entity/academic-degree.entity'

export class ListAcademicDegreeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Texto para pesquisar na designação ou sigla',
    example: 'lic',
  })
  @IsOptional()
  @IsString()
  declare search?: string

  @ApiPropertyOptional({
    description: 'Filtrar pelo estado',
    enum: AcademicDegreeStatus,
    enumName: 'AcademicDegreeStatus',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AcademicDegreeStatus)
  declare status?: AcademicDegreeStatus

  @ApiPropertyOptional({
    description: 'Filtrar pela ordem',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  declare order?: number
}
