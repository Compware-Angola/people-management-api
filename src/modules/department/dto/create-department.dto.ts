import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Descrição do departamento',
    example: 'Recursos Humanos',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  description: string

  @ApiPropertyOptional({
    description: 'Estado do departamento (1 = ativo, 0 = inativo)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsIn([0, 1])
  status?: number
}
