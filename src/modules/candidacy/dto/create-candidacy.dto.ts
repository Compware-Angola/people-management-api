import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateCandidacyDto {
  @ApiProperty({
    description:
      'Código público da vaga à qual o candidato autenticado se quer candidatar',
    example: 'VAG-2026-000001',
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  vacancyCode: string
}
