import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'

export enum FinancialDecision {
  APPROVE = 'APROVAR',
  APPROVE_PARTIAL = 'APROVAR_PARCIALMENTE',
  REJECT = 'REJEITAR',
}

export enum BudgetAvailability {
  AVAILABLE = 'Disponível',
  PARTIALLY_AVAILABLE = 'Parcialmente disponível',
  UNAVAILABLE = 'Indisponível',
}

export class AnalyzeRequisitionFinancialDto {
  @ApiProperty({
    enum: FinancialDecision,
    description: 'Decisão da Direção Administrativa e Financeira',
    example: FinancialDecision.APPROVE,
  })
  @IsEnum(FinancialDecision)
  decision: FinancialDecision

  @ApiProperty({
    enum: BudgetAvailability,
    description: 'Disponibilidade orçamentária',
    example: BudgetAvailability.AVAILABLE,
  })
  @IsEnum(BudgetAvailability)
  budgetAvailability: BudgetAvailability

  @ApiPropertyOptional({
    description:
      'Quantidade autorizada. Obrigatória na aprovação parcial; não pode ser superior à quantidade solicitada.',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  authorizedQuantity?: number

  @ApiPropertyOptional({
    description: 'Período ou exercício orçamentário',
    example: '2026',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  budgetExercise?: string

  @ApiPropertyOptional({
    description: 'Justificativa. Obrigatória quando a decisão for REJEITAR.',
    example: 'Sem dotação orçamentária disponível para o exercício.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  justification?: string

  @ApiPropertyOptional({
    description: 'Parecer administrativo e financeiro',
    example: 'Contratação viável dentro da dotação prevista.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  opinion?: string

  @ApiPropertyOptional({
    description: 'Observações complementares',
    example: 'Autorização condicionada à contratação em janeiro.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observation?: string
}
