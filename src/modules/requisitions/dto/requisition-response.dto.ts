import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class RequisitionDepartmentDto {
  @ApiProperty({ description: 'Código do departamento', example: 1 })
  declare code: number

  @ApiProperty({
    description: 'Descrição do departamento',
    example: 'Recursos Humanos',
  })
  declare description: string
}

class RequisitionCostCenterDto {
  @ApiProperty({ description: 'Código do centro de custo', example: 1 })
  declare code: number

  @ApiProperty({ description: 'Descrição do centro de custo', example: 'RH' })
  declare description: string
}

class RequisitionPositionDto {
  @ApiProperty({ description: 'Código do cargo', example: 1 })
  declare code: number

  @ApiProperty({ description: 'Descrição do cargo', example: 'Analista de RH' })
  declare description: string
}

class RequisitionHiringTypeDto {
  @ApiProperty({ description: 'Código do tipo de contratação', example: 1 })
  declare code: number

  @ApiProperty({ description: 'Sigla do tipo de contratação', example: 'CTI' })
  declare acronym: string

  @ApiProperty({
    description: 'Descrição do tipo de contratação',
    example: 'Contrato por tempo indeterminado',
  })
  declare description: string
}

class RequisitionVacancyRequestTypeDto {
  @ApiProperty({
    description: 'Código do tipo de requisição de vaga',
    example: 1,
  })
  declare id: number

  @ApiProperty({ description: 'Sigla do tipo de requisição', example: 'DOC' })
  declare acronym: string

  @ApiProperty({
    description: 'Descrição do tipo de requisição',
    example: 'Vaga docente',
  })
  declare description: string
}

class RequisitionRequesterDto {
  @ApiProperty({ description: 'Código do solicitante', example: 1 })
  declare id: number

  @ApiProperty({ description: 'Nome do solicitante', example: 'João da Silva' })
  declare name: string
}

class RequisitionStateDto {
  @ApiProperty({ description: 'Código do estado', example: 1 })
  declare code: number

  @ApiProperty({ description: 'Sigla do estado', example: 'RASCUNHO' })
  declare acronym: string

  @ApiProperty({ description: 'Descrição do estado', example: 'Rascunho' })
  declare description: string
}

class RequisitionHistoryStateDto {
  @ApiProperty({ description: 'Sigla do estado', example: 'AGUARDANDO_RH' })
  declare acronym: string

  @ApiProperty({
    description: 'Descrição do estado',
    example: 'Aguardando análise do RH',
  })
  declare description: string
}

class RequisitionHistoryResponsibleDto {
  @ApiProperty({ description: 'Código do responsável', example: 1 })
  declare id: number

  @ApiProperty({
    description: 'Nome do responsável',
    example: 'Maria Fernandes',
  })
  declare name: string
}

export class RequisitionHistoryResponseDto {
  @ApiProperty({ description: 'Código do registro de histórico', example: 1 })
  declare code: number

  @ApiProperty({ description: 'Ação executada', example: 'ENVIO' })
  declare action: string

  @ApiPropertyOptional({
    description: 'Decisão tomada (aprovar/rejeitar)',
    example: 'APROVAR',
  })
  declare decision: string | null

  @ApiPropertyOptional({
    description: 'Parecer do analista',
    example: 'De acordo',
  })
  declare opinion: string | null

  @ApiPropertyOptional({
    description: 'Disponibilidade orçamentária',
    example: 'DISPONIVEL',
  })
  declare budgetAvailability: string | null

  @ApiPropertyOptional({
    description: 'Quantidade autorizada',
    example: 2,
  })
  declare authorizedQuantity: number | null

  @ApiPropertyOptional({
    description: 'Exercício orçamentário',
    example: '2026',
  })
  declare budgetExercise: string | null

  @ApiPropertyOptional({
    description: 'Observação',
    example: 'Aguardando orçamento do próximo trimestre',
  })
  declare observation: string | null

  @ApiProperty({
    description: 'Data do evento',
    example: '2026-08-04T10:00:00.000Z',
  })
  declare date: Date

  @ApiProperty({ type: RequisitionHistoryStateDto })
  declare state: RequisitionHistoryStateDto

  @ApiProperty({ type: RequisitionHistoryResponsibleDto })
  declare responsible: RequisitionHistoryResponsibleDto
}

export class RequisitionResponseDto {
  @ApiProperty({ description: 'Código interno da requisição', example: 1 })
  declare code: number

  @ApiProperty({
    description: 'Código público da requisição',
    example: 'REQ-2026-000001',
  })
  declare requisitionCode: string

  @ApiProperty({ type: RequisitionDepartmentDto })
  declare department: RequisitionDepartmentDto

  @ApiProperty({ type: RequisitionCostCenterDto })
  declare costCenter: RequisitionCostCenterDto

  @ApiProperty({ type: RequisitionPositionDto })
  declare position: RequisitionPositionDto

  @ApiProperty({ description: 'Quantidade solicitada', example: 2 })
  declare quantity: number

  @ApiProperty({
    description: 'Justificativa da necessidade da contratação',
    example: 'Reforço da equipa de atendimento.',
  })
  declare justification: string

  @ApiProperty({ type: RequisitionHiringTypeDto })
  declare hiringType: RequisitionHiringTypeDto

  @ApiProperty({ type: RequisitionVacancyRequestTypeDto })
  declare vacancyRequestType: RequisitionVacancyRequestTypeDto

  @ApiProperty({ type: RequisitionRequesterDto })
  declare requester: RequisitionRequesterDto

  @ApiProperty({ type: RequisitionStateDto })
  declare state: RequisitionStateDto

  @ApiPropertyOptional({
    description: 'Quantidade autorizada',
    example: 2,
  })
  declare authorizedQuantity: number | null

  @ApiPropertyOptional({
    description: 'Data de envio para aprovação',
    example: '2026-08-04T10:00:00.000Z',
  })
  declare sentAt: Date | null

  @ApiProperty({
    description: 'Data de criação',
    example: '2026-08-04T10:00:00.000Z',
  })
  declare createdAt: Date

  @ApiPropertyOptional({
    description: 'Data da última atualização',
    example: '2026-08-04T10:00:00.000Z',
  })
  declare updatedAt: Date | null

  @ApiPropertyOptional({
    type: [RequisitionHistoryResponseDto],
    description: 'Histórico do fluxo de aprovação',
  })
  history?: RequisitionHistoryResponseDto[]
}
