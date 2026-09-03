import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'

import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

export class ListInterviewScheduleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Texto para pesquisar no local, link, observação ou justificativa',
    example: 'sala 3',
  })
  @IsOptional()
  @IsString()
  declare search?: string

  @ApiPropertyOptional({
    description: 'Filtrar pela candidatura',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  declare applicationId?: number

  @ApiPropertyOptional({
    description: 'Filtrar pela modalidade',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  declare modalityId?: number

  @ApiPropertyOptional({
    description: 'Filtrar pelo estado do agendamento',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  declare stateId?: number
}
