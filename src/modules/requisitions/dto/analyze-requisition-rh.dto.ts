import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'
import { RhDecision } from '../constants'

export class AnalyzeRequisitionRhDto {
  @ApiProperty({
    enum: RhDecision,
    description: 'Decisão do RH: recomendar a aprovação ou rejeitar',
    example: RhDecision.APPROVE,
  })
  @IsEnum(RhDecision)
  declare decision: RhDecision
  @ApiPropertyOptional({
    description:
      'Justificativa/observação. Obrigatória quando a decisão for REJEITAR.',
    example: 'O cargo não está cadastrado no plano de pessoal.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  declare justification: string

  @ApiProperty({
    description: 'Parecer do RH',
    example: 'Solicitação completa e alinhada ao planejamento de pessoal.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  declare opinion: string
}
