import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { HiringTypesService } from '../services/hiring-types.service'
import { HiringType } from '../entity/hiring-type.entity'
import { ListHiringTypesQueryDto } from '../dto/list-hiring-types-query.dto'

@ApiTags('Hiring Types')
@Controller('hiring-types')
export class HiringTypesController {
  constructor(private readonly hiringTypesService: HiringTypesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Listar tipos de contratação (seed por regra de negócio; com paginação, busca e filtros)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de tipos de contratação.',
    type: [HiringType],
  })
  findAll(@Query() query: ListHiringTypesQueryDto) {
    return this.hiringTypesService.findAll(query)
  }

  @Get(':code')
  @ApiOperation({ summary: 'Buscar um tipo de contratação pelo código' })
  @ApiParam({
    name: 'code',
    description: 'Código do tipo de contratação',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de contratação encontrado.',
    type: HiringType,
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de contratação não encontrado.',
  })
  findOne(@Param('code', ParseIntPipe) code: number) {
    return this.hiringTypesService.findOne(code)
  }
}
