import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator'

export class ExperienceItemDto {
  @ApiProperty({
    example: 'Universidade X',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(2)
  declare institution: string

  @ApiProperty({
    example: 'Informática',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(2)
  declare area: string

  @ApiProperty({
    example: 'Professor',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(2)
  declare role: string

  @ApiProperty({
    example: '2020-01-01',
  })
  @IsDateString()
  declare startYear: string

  @ApiProperty({
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endYear?: string
}
