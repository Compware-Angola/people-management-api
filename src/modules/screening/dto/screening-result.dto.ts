import { ApiProperty } from '@nestjs/swagger'

export class CriterionScoreDto {
  @ApiProperty({ description: 'SIGLA do critério', example: 'GRAU_ACADEMICO' })
  sigla: string

  @ApiProperty({ description: 'Descrição do critério', example: 'Grau acadêmico' })
  description: string

  @ApiProperty({ description: 'Peso do critério na vaga (%)', example: 30 })
  weight: number

  @ApiProperty({ description: 'Nota do critério (0–100)', example: 100 })
  score: number

  @ApiProperty({
    description: 'Contribuição na nota final (score × peso / 100)',
    example: 30,
  })
  contribution: number

  @ApiProperty({
    description:
      'false quando não há estratégia de cálculo para a SIGLA (nota tratada como 0)',
    example: true,
  })
  evaluated: boolean
}

export class CandidateScreeningDto {
  @ApiProperty({ description: 'Código do candidato (GP_CANDIDATOS.CODIGO)', example: 6 })
  candidateId: number

  @ApiProperty({ description: 'Usuário associado', example: 193, nullable: true })
  userId: number | null

  @ApiProperty({
    description: 'Candidatura de origem (legado)',
    example: 1487,
    nullable: true,
  })
  candidaturaId: number | null

  @ApiProperty({ description: 'Nota final ponderada (0–100)', example: 90 })
  finalScore: number

  @ApiProperty({ type: [CriterionScoreDto] })
  criteria: CriterionScoreDto[]
}

export class VacancyScreeningResultDto {
  @ApiProperty({ description: 'Código interno da vaga', example: 21 })
  vacancyId: number

  @ApiProperty({ description: 'Código público da vaga', example: 'VAG-2026-000003' })
  vacancyCode: string

  @ApiProperty({ description: 'Soma dos pesos dos critérios configurados', example: 100 })
  totalWeight: number

  @ApiProperty({
    description: 'Candidatos ordenados da maior para a menor nota final',
    type: [CandidateScreeningDto],
  })
  candidates: CandidateScreeningDto[]
}
