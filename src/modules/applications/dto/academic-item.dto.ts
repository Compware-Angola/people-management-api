import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsString, Matches, MinLength } from 'class-validator'

export class AcademicItemDto {
  @ApiProperty({
    example: 94,
    description: 'ID do curso',
  })
  @Type(() => Number)
  @IsInt()
  declare course: number

  @ApiProperty({
    example: 2,
    description: 'ID do nível académico',
  })
  @Type(() => Number)
  @IsInt()
  declare academicLevel: number

  @ApiProperty({
    example: 'Universidade Agostinho Neto',
  })
  @IsString()
  @MinLength(2)
  declare institution: string

  @ApiProperty({
    example: '2024',
  })
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'Ano inválido',
  })
  declare completionYear: string
}
