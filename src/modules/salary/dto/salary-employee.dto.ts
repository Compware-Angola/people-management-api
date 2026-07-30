import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class CreateSalaryEmployeeDto {
  @ApiPropertyOptional({
    description: 'Código da estrutura salarial',
    example: 1,
  })
  @IsNumber()
  salaryId: number

  @ApiPropertyOptional({
    description: 'Código do colaborador',
    example: 1,
  })
  @IsNumber()
  employeeId: number
}
