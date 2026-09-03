import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator'
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'
import { CandidacyStateCode } from '../entities/candidacy.entity'

/**
 * Filtros da listagem geral de candidaturas (visão administrativa).
 */
export class ListCandidaciesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar/pesquisar pelo código da vaga',
    example: 'VAG-2026-000001',
  })
  @IsOptional()
  @IsString()
  vacancyCode?: string

  @ApiPropertyOptional({
    description: 'Filtrar pelo código do perfil de candidatura do candidato',
    example: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  candidateId?: number

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

  @ApiPropertyOptional({
    description: 'Data inicial do período de submissão (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  createdStart?: string

  @ApiPropertyOptional({
    description: 'Data final do período de submissão (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  createdEnd?: string
}
