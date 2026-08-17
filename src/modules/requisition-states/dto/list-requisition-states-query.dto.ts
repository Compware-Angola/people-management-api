import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

export class ListRequisitionStatesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Termo de busca pela descrição',
    example: 'RH',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filtrar pela sigla',
    example: 'AGUARDANDO_RH',
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
