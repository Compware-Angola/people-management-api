import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator'

export class CreateCriteriaVacancyDto {
  @ApiProperty({
    description: 'Código da vaga',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  declare vacancyId: number

  @ApiProperty({
    description: 'Código do critério',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  declare criteriaId: number

  @ApiProperty({
    description: 'Peso percentual do critério na vaga',
    example: 40,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  declare weight: number
}
