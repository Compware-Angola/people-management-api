import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from 'src/commons/dto/pagination.dto'

export class ListUserCollaboratorQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        description:
            'Texto para pesquisar por nome, email, username ou bilhete de identidade',
        example: 'john',
    })
    @IsOptional()
    @IsString()
    declare search?: string

    @ApiPropertyOptional({
        description: 'Filtrar pelo estado da pessoa (1 = ativo, 0 = inativo)',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsIn([0, 1])
    declare status?: number
}
