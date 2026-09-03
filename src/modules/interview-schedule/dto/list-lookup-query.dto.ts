import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

export class ListLookupQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Texto para pesquisar na designação',
    example: 'online',
  })
  @IsOptional()
  @IsString()
  declare search?: string
}
