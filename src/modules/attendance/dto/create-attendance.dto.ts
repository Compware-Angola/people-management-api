import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export enum AttendanceSituation {
  PRESENTE = 'PRESENTE',
  FALTA = 'FALTA',
  LICENCA = 'LICENCA',
  FERIAS = 'FERIAS',
  ATRASO = 'ATRASO',
}

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'Código do colaborador' })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  employeeId: number;

  @ApiProperty({ example: '2026-07-09T08:00:00Z', description: 'Data de início' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-07-09T17:00:00Z', description: 'Data de fim' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 8.5, description: 'Horas trabalhadas' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Max(999.99)
  hours?: number;

  @ApiProperty({
    example: 'PRESENTE',
    enum: AttendanceSituation,
    description: 'Situação da assiduidade',
  })
  @IsEnum(AttendanceSituation)
  @IsNotEmpty()
  situation: AttendanceSituation;
}
