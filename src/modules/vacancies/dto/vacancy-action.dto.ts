import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class VacancyActionDto {
  @ApiProperty({
    description:
      'Justificativa da ação (obrigatória para suspender, encerrar ou cancelar)',
    example: 'Processo seletivo suspenso para reavaliação do edital.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  justification: string

  @ApiPropertyOptional({
    description: 'Observação complementar',
    example: 'Candidaturas já recebidas serão preservadas.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observation?: string
}
