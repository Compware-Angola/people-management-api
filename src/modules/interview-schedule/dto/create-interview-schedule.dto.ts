import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateInterviewScheduleDto {
  @ApiProperty({
    description: 'Código da candidatura associada à entrevista',
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  applicationId: number

  @ApiProperty({
    description: 'Data e hora de início da entrevista (ISO 8601)',
    example: '2026-09-10T14:00:00.000Z',
  })
  @IsDateString(
    {},
    { message: 'A data da entrevista deve estar no formato ISO 8601' },
  )
  interviewDate: string

  @ApiPropertyOptional({
    description: 'Duração prevista da entrevista, em minutos',
    example: 60,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes?: number

  @ApiPropertyOptional({
    description: 'Hora de fim da entrevista (HH:MM)',
    example: '15:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'A hora de fim deve estar no formato HH:MM',
  })
  endTime?: string

  @ApiProperty({
    description: 'Código da modalidade (GP_MODALIDADE)',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  modalityId: number

  @ApiPropertyOptional({
    description: 'Local da entrevista (para modalidade presencial)',
    example: 'Sala 3, Edifício A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string

  @ApiPropertyOptional({
    description: 'Link da reunião (para modalidade online)',
    example: 'https://meet.example.com/abc-defg-hij',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  link?: string

  @ApiPropertyOptional({
    description: 'Observação',
    example: 'Candidato pediu para ser entrevistado de manhã.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string

  @ApiPropertyOptional({
    description: 'Justificativa (ex.: motivo de reagendamento ou cancelamento)',
    example: 'Reagendada a pedido do entrevistador.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  justification?: string

  @ApiPropertyOptional({
    description:
      'Código do estado (GP_ESTADO_AGENDAMENTO_ENTREVISTA). Se omitido, assume "AGENDADA".',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stateId?: number

  @ApiPropertyOptional({
    description:
      'Códigos dos utilizadores (GP_USUARIOS) que serão entrevistadores',
    example: [2, 5],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  interviewerUserIds?: number[]
}
