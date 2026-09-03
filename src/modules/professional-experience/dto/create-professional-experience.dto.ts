import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

export class CreateProfessionalExperienceDto {
  @ApiProperty({
    description: 'Name of the institution where the professional worked.',
    example: 'DExpress',
  })
  @IsString()
  @IsNotEmpty()
  institution: string

  @ApiProperty({
    description: 'Professional area in which the person worked.',
    example: 'Information Technology',
  })
  @IsString()
  @IsNotEmpty()
  area: string

  @ApiProperty({
    description: 'Function performed by the professional.',
    example: 'Web Developer',
  })
  @IsString()
  @IsNotEmpty()
  function: string

  @ApiProperty({
    description: 'Professional position held by the person.',
    example: 'Software Developer',
  })
  @IsString()
  @IsNotEmpty()
  position: string

  @ApiProperty({
    description: 'Year in which the professional experience started.',
    example: 2022,
    minimum: 1800,
    maximum: 2100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  @Max(2100)
  startYear: number

  @ApiProperty({
    description:
      'Year in which the professional experience ended. Leave empty if the experience is still ongoing.',
    example: 2025,
    minimum: 1800,
    maximum: 2100,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  @Max(2100)
  endYear?: number
}
