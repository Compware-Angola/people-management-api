import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export enum FileType {
  BI = 'BI',
  NIF = 'NIF',
  CONTRATO = 'CONTRATO',
  CURRICULO = 'CURRICULO',
  CERTIFICADO = 'CERTIFICADO',
  DIPLOMA = 'DIPLOMA',
  DECLARACAO = 'DECLARACAO',
  FOTO = 'FOTO',
  OUTRO = 'OUTRO',
}

export class CreateFileDto {
  @ApiProperty({ example: 1, description: 'ID do usu[ario' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ enum: FileType, example: 'BI' })
  @IsEnum(FileType)
  @IsNotEmpty()
  type: FileType;

  @ApiProperty({ example: 'documentos/colaborador_1/bi.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  path: string;

  @ApiProperty({ example: 'bi_original.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalName: string;

  @ApiPropertyOptional({ example: 'Cópia do Bilhete de Identidade' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
