import { PaginationQueryDto } from '../../../commons/dto/pagination.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export class SalaryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por código' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number

  @ApiPropertyOptional({ description: 'Filtrar por cargo', example: 'Gestor' })
  @IsOptional()
  @IsString()
  position?: string

  @ApiPropertyOptional({
    description: 'Filtrar por categoria',
    example: 'Administrativo',
  })
  @IsOptional()
  @IsString()
  category?: string
}

export class CreateSalaryDto {
  @ApiPropertyOptional({ description: 'Cargo', example: 'Gestor' })
  @IsString()
  position: string

  @ApiPropertyOptional({ description: 'Categoria', example: 'Administrativo' })
  @IsString()
  category: string

  @ApiPropertyOptional({
    description: 'Descrição',
    example: 'Gestão de equipes',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: 'Salário base', example: 150000 })
  @IsNumber()
  @Min(0)
  baseSalary: number
}

export class UpdateSalaryDto {
  @ApiPropertyOptional({ description: 'Cargo', example: 'Gestor' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  position?: string

  @ApiPropertyOptional({ description: 'Categoria', example: 'Administrativo' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string

  @ApiPropertyOptional({
    description: 'Descrição',
    example: 'Gestão de equipes',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: 'Salário base', example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number

  @ApiPropertyOptional({
    description: 'Estado da estrutura salarial (0 = Inativo, 1 = Ativo)',
    default: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @IsNumber()
  @IsEnum([0, 1])
  status?: number
}
