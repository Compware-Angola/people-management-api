import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../commons/dto/pagination.dto';

export class EmployeeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar pelo Bilhete de Identidade (BI)',
    example: '003093887BE035',
  })
  @IsOptional()
  @IsString()
  bi?: string;
}
