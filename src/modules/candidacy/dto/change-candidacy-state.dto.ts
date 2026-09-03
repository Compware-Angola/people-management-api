import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'
import { CandidacyStateCode } from '../entities/candidacy.entity'

/**
 * Mudança de estado de uma candidatura pela equipa de recrutamento.
 * A desistência (RETIRADA) não é permitida aqui — só o próprio candidato a pode registar.
 */
export class ChangeCandidacyStateDto {
  @ApiProperty({
    description:
      'Novo estado da candidatura (2=Em análise, 3=Admitida, 4=Rejeitada)',
    enum: CandidacyStateCode,
    example: CandidacyStateCode.UNDER_REVIEW,
  })
  @Type(() => Number)
  @IsEnum(CandidacyStateCode)
  state: CandidacyStateCode

  @ApiPropertyOptional({
    description: 'Observação/justificativa da mudança de estado',
    example: 'Perfil académico compatível com os requisitos da vaga.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string
}
