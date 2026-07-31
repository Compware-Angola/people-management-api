import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({
    description: 'Descrição do cargo',
    example: 'Desenvolvedor',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  description: string;
  @ApiProperty({
    description: 'Estado do cargo',
    example: 1,
    minimum: 0,
    maximum: 1,
    enum: [0, 1],
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}