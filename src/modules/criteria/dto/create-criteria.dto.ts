import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import { CriteriaStatus } from '../entity/criteria.entity'

export class CreateCriteriaDto {
  @ApiProperty({
    description: 'Descrição do critério',
    example: 'Experiência profissional',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  declare description: string

  @ApiProperty({
    description: 'Estado do critério',
    enum: CriteriaStatus,
    enumName: 'CriteriaStatus',
    example: CriteriaStatus.ACTIVE,
    required: false,
    default: CriteriaStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CriteriaStatus)
  declare status?: CriteriaStatus
}
