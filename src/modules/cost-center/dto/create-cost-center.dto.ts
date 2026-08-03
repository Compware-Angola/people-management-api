import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CreateCostCenterDto {
  @ApiProperty({
    description: 'Código do departamento ao qual o centro de custo pertence',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  departmentId: number

  @ApiProperty({
    description: 'Descrição do centro de custo',
    example: 'Marketing Digital',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  description: string

  @ApiPropertyOptional({
    description: 'Estado do centro de custo (1 = ativo, 0 = inativo)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsIn([0, 1])
  status?: number
}
