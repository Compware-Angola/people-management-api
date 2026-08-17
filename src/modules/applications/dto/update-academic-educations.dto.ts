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

export class UpdateAcademicEducationItemDto {
  @ApiPropertyOptional({
    description: 'ID do registo existente. Omitir para criar um novo.',
    example: 1500,
  })
  @IsOptional()
  @IsInt()
  id?: number

  @ApiProperty({ description: 'ID do curso/área de formação', example: '94' })
  @IsNotEmpty()
  @IsString()
  course: string

  @ApiProperty({ description: 'ID do grau académico', example: '2' })
  @IsNotEmpty()
  @IsString()
  academicLevel: string

  @ApiProperty({
    description: 'Instituição de ensino',
    example: 'Universidade Agostinho Neto',
  })
  @IsNotEmpty()
  @IsString()
  institution: string

  @ApiProperty({ description: 'Ano de conclusão', example: '2023' })
  @IsNotEmpty()
  @IsString()
  completionYear: string
}

export class UpdateAcademicEducationsDto {
  @ApiProperty({ type: [UpdateAcademicEducationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAcademicEducationItemDto)
  items: UpdateAcademicEducationItemDto[]
}
