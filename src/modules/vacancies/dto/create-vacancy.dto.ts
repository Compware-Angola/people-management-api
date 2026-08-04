import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator'

export class CreateVacancyDto {
  @ApiProperty({
    description:
      'Código interno da requisição aprovada que autoriza a abertura da vaga',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  requisitionId: number

  @ApiPropertyOptional({
    description:
      'Número de vagas a cadastrar. Quando ausente, usa a quantidade autorizada restante da requisição.',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfVacancies?: number

  @ApiPropertyOptional({
    description:
      'Data de publicação. Quando futura, a vaga fica agendada; quando presente, é publicada imediatamente.',
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
