import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

export class ListVacancyStatesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Termo de busca pela descrição',
    example: 'Publicada',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filtrar pela sigla',
    example: 'PUBLICADA',
  })
  @IsOptional()
  @IsString()
  acronym?: string

  @ApiPropertyOptional({
    description: 'Filtrar por código de estado',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  code?: number
}
