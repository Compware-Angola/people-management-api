import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional } from 'class-validator'
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

export class ListCriteriaVacancyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar pelo código da vaga',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  declare vacancyId?: number

  @ApiPropertyOptional({
    description: 'Filtrar pelo código do critério',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  declare criteriaId?: number
}
