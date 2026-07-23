import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Nome único da permissão', example: 'USUARIO:CRIAR' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Estado da permissão (0 = Inativo, 1 = Ativo)', default: 1, enum: [0, 1] })
  @IsNumber()
  @IsOptional()
  @IsEnum([0, 1])
  status?: number;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ description: 'Nome único da permissão', example: 'USUARIO:CRIAR' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Estado da permissão (0 = Inativo, 1 = Ativo)', default: 1, enum: [0, 1] })
  @IsNumber()
  @IsOptional()
  @IsEnum([0, 1])
  status?: number;
}

export class UpdateRelationStatusDto {
  @ApiProperty({ description: 'Estado (0 = Inativo, 1 = Ativo)', enum: [0, 1] })
  @IsNumber()
  @IsNotEmpty()
  @IsEnum([0, 1])
  status: number;
}
