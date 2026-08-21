import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class CreateContractEmployeeDto {
  @ApiPropertyOptional({
    description: 'Código do contrato',
    example: 1,
  })
  @IsNumber()
  contractId: number

  @ApiPropertyOptional({
    description: 'Código do colaborador',
    example: 1,
  })
  @IsNumber()
  employeeId: number
}
