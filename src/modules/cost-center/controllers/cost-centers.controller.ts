import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { CostCentersService } from '../services/cost-centers.service'
import { CostCenter } from '../entity/cost-center.entity'
import { CreateCostCenterDto } from '../dto/create-cost-center.dto'
import { ListCostCentersQueryDto } from '../dto/list-cost-centers-query.dto'
import { UpdateCostCenterDto } from '../dto/update-cost-center.dto'

@ApiTags('Cost Centers')
@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo centro de custo' })
  @ApiResponse({
    status: 201,
    description: 'Centro de custo criado com sucesso.',
    type: CostCenter,
  })
  create(@Body() dto: CreateCostCenterDto) {
    return this.costCentersService.create(dto)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar centros de custo (com paginação, busca e filtros)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de centros de custo.',
    type: [CostCenter],
  })
  findAll(@Query() query: ListCostCentersQueryDto) {
    return this.costCentersService.findAll(query)
  }

  @Get(':code')
  @ApiOperation({ summary: 'Buscar um centro de custo pelo código' })
  @ApiParam({
    name: 'code',
    description: 'Código do centro de custo',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Centro de custo encontrado.',
    type: CostCenter,
  })
  @ApiResponse({ status: 404, description: 'Centro de custo não encontrado.' })
  findOne(@Param('code', ParseIntPipe) code: number) {
    return this.costCentersService.findOne(code)
  }

  @Patch(':code')
  @ApiOperation({ summary: 'Atualizar um centro de custo' })
  @ApiParam({
    name: 'code',
    description: 'Código do centro de custo',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Centro de custo atualizado com sucesso.',
    type: CostCenter,
  })
  @ApiResponse({ status: 404, description: 'Centro de custo não encontrado.' })
  update(
    @Param('code', ParseIntPipe) code: number,
    @Body() dto: UpdateCostCenterDto,
  ) {
    return this.costCentersService.update(code, dto)
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um centro de custo' })
  @ApiParam({
    name: 'code',
    description: 'Código do centro de custo',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Centro de custo removido com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Centro de custo não encontrado.' })
  remove(@Param('code', ParseIntPipe) code: number) {
    return this.costCentersService.remove(code)
  }
}
