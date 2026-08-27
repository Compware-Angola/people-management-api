import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from '../../../commons/dto/pagination.dto'
import { RubricType, ValueType } from '../entities/rubric.entity'

export class CreateRubricDto {
  @ApiProperty({ description: 'Descrição', example: 'Bônus de produtividade' })
  @IsString()
  description: string

  @ApiProperty({
    description: 'Tipo da rubrica',
    enum: RubricType,
    example: RubricType.EARNING,
  })
  @IsEnum(RubricType)
  type: RubricType

  @ApiProperty({
    description: 'Tipo de valor da rubrica',
    enum: ValueType,
    example: ValueType.FIXED,
  })
  @IsEnum(ValueType)
  valueType: ValueType

  @ApiProperty({ description: 'Valor', example: 100 })
  @IsNumber()
  value: number

  @ApiProperty({
    description: 'Estado da rubrica (0 = Inativo, 1 = Ativo)',
    default: 1,
    enum: [0, 1],
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsEnum([0, 1])
  status?: number
}

export class RubricQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Filtrar por descrição da rubrica',
    required: false,
    example: 'Subsídio',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty({
    description: 'Filtrar por tipo da rubrica',
    enum: RubricType,
    required: false,
  })
  @IsOptional()
  @IsEnum(RubricType)
  type?: RubricType

  @ApiProperty({
    description: 'Filtrar por tipo de valor da rubrica',
    enum: ValueType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ValueType)
  valueType?: ValueType

  @ApiProperty({
    description: 'Filtrar por estado da rubrica (0 = Inativo, 1 = Ativo)',
    enum: [0, 1],
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum([0, 1])
  status?: number
}
