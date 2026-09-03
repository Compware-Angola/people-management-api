import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'
import { CandidacyStateCode } from '../entities/candidacy.entity'

/**
 * Filtros da listagem de candidaturas na visão do próprio candidato.
 */
export class ListMyCandidaciesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Filtrar por estado da candidatura (1=Submetida, 2=Em análise, 3=Admitida, 4=Rejeitada, 5=Retirada)',
    enum: CandidacyStateCode,
    example: CandidacyStateCode.SUBMITTED,
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(CandidacyStateCode)
  state?: CandidacyStateCode
}
