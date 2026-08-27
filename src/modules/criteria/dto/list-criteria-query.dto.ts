import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { CriteriaStatus } from '../entity/criteria.entity'
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

export class ListCriteriaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Texto para pesquisar na descrição',
    example: 'experiência',
  })
  @IsOptional()
  @IsString()
  declare search?: string

  @ApiPropertyOptional({
    description: 'Filtrar pelo estado',
    enum: CriteriaStatus,
    enumName: 'CriteriaStatus',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(CriteriaStatus)
  declare status?: CriteriaStatus
}
