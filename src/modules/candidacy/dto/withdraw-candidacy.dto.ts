import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class WithdrawCandidacyDto {
  @ApiPropertyOptional({
    description: 'Motivo da desistência da candidatura',
    example: 'Aceitei outra oportunidade profissional.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string
}
