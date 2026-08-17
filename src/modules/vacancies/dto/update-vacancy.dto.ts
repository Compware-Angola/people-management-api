import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator'

export class UpdateVacancyDto {
  @ApiPropertyOptional({
    description: 'Número de vagas',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfVacancies?: number

  @ApiPropertyOptional({
    description: 'Data de publicação',
    example: '2026-08-10',
  })
  @IsOptional()
  @IsDateString()
  publicationDate?: string

  @ApiPropertyOptional({
    description:
      'Data de encerramento. Deve ser posterior à data de publicação.',
    example: '2026-09-10',
  })
  @IsOptional()
  @IsDateString()
  closingDate?: string
}
