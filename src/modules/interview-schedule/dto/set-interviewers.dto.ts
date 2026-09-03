import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  Min,
} from 'class-validator'

export class SetInterviewersDto {
  @ApiProperty({
    description:
      'Códigos dos utilizadores (GP_USUARIOS) que passam a ser os entrevistadores. Substitui a lista atual.',
    example: [2, 5, 9],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  userIds: number[]
}
