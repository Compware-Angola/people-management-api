import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class RequisitionDepartmentDto {
  @ApiProperty({ description: 'Código do departamento', example: 1 })
  code: number

  @ApiProperty({ description: 'Descrição do departamento', example: 'Recursos Humanos' })
  description: string
}

class RequisitionCostCenterDto {
  @ApiProperty({ description: 'Código do centro de custo', example: 1 })
  code: number

  @ApiProperty({ description: 'Descrição do centro de custo', example: 'RH' })
  description: string
}

class RequisitionPositionDto {
  @ApiProperty({ description: 'Código do cargo', example: 1 })
  code: number

  @ApiProperty({ description: 'Descrição do cargo', example: 'Analista de RH' })
  description: string
}

class RequisitionHiringTypeDto {
  @ApiProperty({ description: 'Código do tipo de contratação', example: 1 })
  code: number

  @ApiProperty({ description: 'Sigla do tipo de contratação', example: 'CTI' })
  acronym: string

  @ApiProperty({
    description: 'Descrição do tipo de contratação',
    example: 'Contrato por tempo indeterminado',
  })
  description: string
}

class RequisitionRequesterDto {
  @ApiProperty({ description: 'Código do solicitante', example: 1 })
  id: number

  @ApiProperty({ description: 'Nome do solicitante', example: 'João da Silva' })
  name: string
}

class RequisitionStateDto {
  @ApiProperty({ description: 'Código do estado', example: 1 })
  code: number

  @ApiProperty({ description: 'Sigla do estado', example: 'RASCUNHO' })
  acronym: string

  @ApiProperty({ description: 'Descrição do estado', example: 'Rascunho' })
  description: string
}

class RequisitionHistoryStateDto {
  @ApiProperty({ description: 'Sigla do estado', example: 'AGUARDANDO_RH' })
  acronym: string

  @ApiProperty({ description: 'Descrição do estado', example: 'Aguardando análise do RH' })
  description: string
}

class RequisitionHistoryResponsibleDto {
  @ApiProperty({ description: 'Código do responsável', example: 1 })
  id: number

  @ApiProperty({ description: 'Nome do responsável', example: 'Maria Fernandes' })
  name: string
}

export class RequisitionHistoryResponseDto {
  @ApiProperty({ description: 'Código do registro de histórico', example: 1 })
  code: number

  @ApiProperty({ description: 'Ação executada', example: 'ENVIO' })
  action: string

  @ApiPropertyOptional({
    description: 'Decisão tomada (aprovar/rejeitar)',
    example: 'APROVAR',
  })
  decision: string | null

  @ApiPropertyOptional({ description: 'Parecer do analista', example: 'De acordo' })
  opinion: string | null

  @ApiPropertyOptional({
    description: 'Disponibilidade orçamentária',
    example: 'DISPONIVEL',
  })
  budgetAvailability: string | null

  @ApiPropertyOptional({
    description: 'Quantidade autorizada',
    example: 2,
  })
  authorizedQuantity: number | null

  @ApiPropertyOptional({ description: 'Exercício orçamentário', example: '2026' })
  budgetExercise: string | null

  @ApiPropertyOptional({
    description: 'Observação',
    example: 'Aguardando orçamento do próximo trimestre',
  })
  observation: string | null

  @ApiProperty({ description: 'Data do evento', example: '2026-08-04T10:00:00.000Z' })
  date: Date

  @ApiProperty({ type: RequisitionHistoryStateDto })
  state: RequisitionHistoryStateDto

  @ApiProperty({ type: RequisitionHistoryResponsibleDto })
  responsible: RequisitionHistoryResponsibleDto
}

export class RequisitionResponseDto {
  @ApiProperty({ description: 'Código interno da requisição', example: 1 })
  code: number

  @ApiProperty({ description: 'Código público da requisição', example: 'REQ-2026-000001' })
  requisitionCode: string

  @ApiProperty({ type: RequisitionDepartmentDto })
  department: RequisitionDepartmentDto

  @ApiProperty({ type: RequisitionCostCenterDto })
  costCenter: RequisitionCostCenterDto

  @ApiProperty({ type: RequisitionPositionDto })
  position: RequisitionPositionDto

  @ApiProperty({ description: 'Quantidade solicitada', example: 2 })
  quantity: number

  @ApiProperty({
    description: 'Justificativa da necessidade da contratação',
    example: 'Reforço da equipa de atendimento.',
  })
  justification: string

  @ApiProperty({ type: RequisitionHiringTypeDto })
  hiringType: RequisitionHiringTypeDto

  @ApiProperty({ type: RequisitionRequesterDto })
  requester: RequisitionRequesterDto

  @ApiProperty({ type: RequisitionStateDto })
  state: RequisitionStateDto

  @ApiPropertyOptional({
    description: 'Quantidade autorizada',
    example: 2,
  })
  authorizedQuantity: number | null

  @ApiPropertyOptional({
    description: 'Data de envio para aprovação',
    example: '2026-08-04T10:00:00.000Z',
  })
  sentAt: Date | null

  @ApiProperty({ description: 'Data de criação', example: '2026-08-04T10:00:00.000Z' })
  createdAt: Date

  @ApiPropertyOptional({
    description: 'Data da última atualização',
    example: '2026-08-04T10:00:00.000Z',
  })
  updatedAt: Date | null

  @ApiPropertyOptional({
    type: [RequisitionHistoryResponseDto],
    description: 'Histórico do fluxo de aprovação',
  })
  history?: RequisitionHistoryResponseDto[]
}
