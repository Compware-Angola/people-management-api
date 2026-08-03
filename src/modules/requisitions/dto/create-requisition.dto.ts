import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateRequisitionDto {
  @ApiProperty({
    description: 'Código do departamento (deve estar ativo)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  departmentId: number

  @ApiProperty({
    description:
      'Código do centro de custo (deve estar ativo e vinculado ao departamento)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  costCenterId: number

  @ApiProperty({
    description: 'Código do cargo (deve estar ativo)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  positionId: number

  @ApiProperty({
    description: 'Quantidade solicitada (número inteiro maior que zero)',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number

  @ApiProperty({
    description: 'Justificativa da necessidade da contratação',
    example: 'Reforço da equipa de atendimento ao estudante.',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  justification: string

  @ApiProperty({
    description: 'Código do tipo de contratação (deve estar ativo)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  hiringTypeId: number

  @ApiPropertyOptional({
    description:
      'Código do solicitante. Quando ausente, é preenchido automaticamente com o usuário autenticado.',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  requesterId?: number
}
