import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto';

export class ListCostCentersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Termo de busca pela descrição',
    example: 'Marketing',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por departamento',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado (1 = ativo, 0 = inativo)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  status?: number;
}