import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class CreateSalaryRubricDto {
  @ApiProperty({ description: 'Código da estrutura salarial', example: 1 })
  @IsNumber()
  salaryStructureCode: number

  @ApiProperty({ description: 'Código da rubrica', example: 1 })
  @IsNumber()
  rubricCode: number
}
