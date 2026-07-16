import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVacationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  employeeId: number;

  @ApiProperty({ example: '2026-07-20' })
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2026-08-18' })
  @IsNotEmpty()
  @IsString()
  endDate: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  days: number;

  @ApiPropertyOptional({ example: 'Férias anuais' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observation?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  approverManagerId?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  approverRhId?: number;

  @ApiPropertyOptional({
    example: 'PENDENTE',
    enum: ['PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO'],
  })
  @IsOptional()
  @IsEnum(['PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO'])
  status?: string;
}
