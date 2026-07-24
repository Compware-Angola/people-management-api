import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class UpdateTeachingExperienceItemDto {
  @ApiPropertyOptional({
    description: 'ID do registo existente. Omitir para criar um novo.',
    example: 1594,
  })
  @IsOptional()
  @IsInt()
  id?: number

  @ApiProperty({ description: 'Curso lecionado', example: 'Matemática' })
  @IsNotEmpty()
  @IsString()
  course: string

  @ApiProperty({ description: 'Instituição onde leccionou', example: 'Colégio São José' })
  @IsNotEmpty()
  @IsString()
  institution: string

  @ApiProperty({ description: 'Disciplina/Actividades', example: 'Álgebra Linear' })
  @IsNotEmpty()
  @IsString()
  discipline: string

  @ApiProperty({ description: 'Ano de início (YYYY-MM-DD)', example: '2020-12-12' })
  @IsNotEmpty()
  @IsString()
  startYear: string

  @ApiProperty({ description: 'Ano de fim (YYYY-MM-DD)', example: '2024-12-12' })
  @IsNotEmpty()
  @IsString()
  endYear: string
}

export class UpdateTeachingExperiencesDto {
  @ApiProperty({ type: [UpdateTeachingExperienceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTeachingExperienceItemDto)
  items: UpdateTeachingExperienceItemDto[]
}