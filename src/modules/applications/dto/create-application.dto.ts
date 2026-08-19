import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator'

import { PersonalDto } from './personal.dto'
import { AcademicItemDto } from './academic-item.dto'
import { ExperienceItemDto } from './experience-item.dto'

import { plainToInstance } from 'class-transformer'

export class CreateApplicationDto {
  @ApiProperty({ type: PersonalDto })
  @Transform(({ value }) =>
    plainToInstance(
      PersonalDto,
      typeof value === 'string' ? JSON.parse(value) : value,
    ),
  )
  @ValidateNested()
  @Type(() => PersonalDto)
  declare personal: PersonalDto

  @ApiProperty({ type: [AcademicItemDto] })
  @Transform(({ value }) =>
    plainToInstance(
      AcademicItemDto,
      typeof value === 'string' ? JSON.parse(value) : value,
    ),
  )
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AcademicItemDto)
  declare academic: AcademicItemDto[]

  @ApiProperty({ type: [ExperienceItemDto] })
  @Transform(({ value }) =>
    plainToInstance(
      ExperienceItemDto,
      typeof value === 'string' ? JSON.parse(value) : value,
    ),
  )
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  declare experience: ExperienceItemDto[]

  @ApiProperty({
    description: 'Key do documento de identificação já enviado ao storage',
  })
  @IsString()
  @IsNotEmpty()
  declare identificationDocument: string

  @ApiProperty({ description: 'Key do currículo já enviado ao storage' })
  @IsString()
  @IsNotEmpty()
  declare cv: string

  @ApiProperty({
    description: 'Key do certificado do curso já enviado ao storage',
  })
  @IsString()
  @IsNotEmpty()
  declare courseCertificate: string

  @ApiProperty({
    description: 'Key da agregação pedagógica já enviada ao storage',
  })
  @IsString()
  @IsNotEmpty()
  declare pedagogicalAggregation: string

  @ApiProperty({
    type: [String],
    description: 'Keys dos diplomas/certificados já enviados ao storage',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  declare certificates: string[]
}
