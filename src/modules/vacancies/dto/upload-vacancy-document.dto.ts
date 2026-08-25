import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export enum VacancyDocumentType {
  EDITAL = 'EDITAL',
  OUTRO = 'OUTRO',
}

export class UploadVacancyDocumentDto {
  @ApiProperty({
    enum: VacancyDocumentType,
    description: 'Tipo do documento',
    example: VacancyDocumentType.EDITAL,
  })
  @IsEnum(VacancyDocumentType)
  @IsNotEmpty()
  type: VacancyDocumentType

  @ApiPropertyOptional({
    description: 'Descrição do documento',
    example: 'Edital de contratação nº 01/2026',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string

  @ApiProperty({
    description:
      'Chave do ficheiro já enviado ao serviço de armazenamento pelo frontend',
  })
  @IsString()
  @IsNotEmpty()
  key: string

  @ApiProperty({
    description: 'Nome original do ficheiro enviado',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalName: string
}
