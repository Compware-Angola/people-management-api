import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import { RequisitionStatesService } from '../services/requisition-states.service'
import { RequisitionState } from '../entity/requisition-state.entity'
import { ListRequisitionStatesQueryDto } from '../dto/list-requisition-states-query.dto'

@ApiTags('Requisition States')
@Controller('requisition-states')
export class RequisitionStatesController {
  constructor(
    private readonly requisitionStatesService: RequisitionStatesService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Listar estados de requisição (seed por regra de negócio; com paginação e busca)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de estados de requisição.',
    type: [RequisitionState],
  })
  findAll(@Query() query: ListRequisitionStatesQueryDto) {
    return this.requisitionStatesService.findAll(query)
  }

  @Get(':code')
  @ApiOperation({ summary: 'Buscar um estado de requisição pelo código' })
  @ApiParam({
    name: 'code',
    description: 'Código do estado de requisição',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de requisição encontrado.',
    type: RequisitionState,
  })
  @ApiResponse({
    status: 404,
    description: 'Estado de requisição não encontrado.',
  })
  findOne(@Param('code', ParseIntPipe) code: number) {
    return this.requisitionStatesService.findOne(code)
  }
}
