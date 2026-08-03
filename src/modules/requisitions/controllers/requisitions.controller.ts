import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { RequisitionsService } from '../services/requisitions.service'
import { Requisition } from '../entity/requisition.entity'
import { CreateRequisitionDto } from '../dto/create-requisition.dto'
import { UpdateRequisitionDto } from '../dto/update-requisition.dto'
import { ListRequisitionsQueryDto } from '../dto/list-requisitions-query.dto'
import { CancelRequisitionDto } from '../dto/cancel-requisition.dto'
import { AnalyzeRequisitionRhDto } from '../dto/analyze-requisition-rh.dto'
import { AnalyzeRequisitionFinancialDto } from '../dto/analyze-requisition-financial.dto'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'
import { Permissions } from 'src/commons/decorators/permissions.decorator'

@ApiTags('Requisitions')
@ApiBearerAuth()
@Controller('requisitions')
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}

  @Post()
  @Permissions('write:requisitions')
  @ApiOperation({ summary: 'Criar uma nova requisição de vaga' })
  @ApiResponse({
    status: 201,
    description: 'Requisição criada com sucesso.',
    type: Requisition,
  })
  create(@Body() dto: CreateRequisitionDto, @Req() req: any) {
    return this.requisitionsService.create(dto, req.user.sub)
  }

  @Get()
  @Permissions('read:requisitions')
  @ApiOperation({
    summary:
      'Listar requisições (com paginação, busca pelo código, nome do solicitante e filtros)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de requisições.',
    type: [Requisition],
  })
  findAll(@Query() query: ListRequisitionsQueryDto) {
    return this.requisitionsService.findAll(query)
  }

  @Get(':code')
  @Permissions('read:requisitions')
  @ApiOperation({ summary: 'Buscar uma requisição pelo código interno' })
  @ApiParam({
    name: 'code',
    description: 'Código interno da requisição',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Requisição encontrada com histórico do fluxo de aprovação.',
    type: Requisition,
  })
  @ApiResponse({ status: 404, description: 'Requisição não encontrada.' })
  findOne(@Param('code') code: string) {
    return this.requisitionsService.findOneByCode(code)
  }

  @Patch(':code')
  @Permissions('write:requisitions')
  @ApiOperation({
    summary: 'Atualizar uma requisição (apenas em estado Rascunho)',
  })
  @ApiParam({
    name: 'code',
    description: 'Código interno da requisição',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Requisição atualizada com sucesso.',
    type: Requisition,
  })
  @ApiResponse({ status: 404, description: 'Requisição não encontrada.' })
  update(@Param('code') code: string, @Body() dto: UpdateRequisitionDto) {
    return this.requisitionsService.update(code, dto)
  }

  @Delete(':code')
  @Permissions('write:requisitions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover uma requisição (apenas em estado Rascunho)',
  })
  @ApiParam({
    name: 'code',
    description: 'Código interno da requisição',
    example: 1,
  })
  @ApiResponse({ status: 204, description: 'Requisição removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Requisição não encontrada.' })
  remove(@Param('code') code: string) {
    return this.requisitionsService.remove(code)
  }

  @Post(':code/send')
  @Permissions('write:requisitions')
  @ApiOperation({ summary: 'Enviar a requisição para aprovação' })
  @ApiParam({
    name: 'code',
    description: 'Código interno da requisição',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Requisição enviada e com estado Aguardando análise do RH.',
    type: Requisition,
  })
  send(@Param('code') code: string, @Req() req: any) {
    return this.requisitionsService.send(code, req.user.sub)
  }

  @Post(':code/cancel')
  @Permissions('write:requisitions')
  @ApiOperation({ summary: 'Cancelar uma requisição (com justificativa)' })
  @ApiParam({
    name: 'code',
    description: 'Código interno da requisição',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Requisição cancelada com sucesso.',
    type: Requisition,
  })
  cancel(
    @Param('code') code: string,
    @Body() dto: CancelRequisitionDto,
    @Req() req: any,
  ) {
    return this.requisitionsService.cancel(code, dto, req.user.sub)
  }

  @Post(':code/analyze/rh')
  @Permissions('write:requisitions')
  @ApiOperation({ summary: 'Analisar a requisição pelo RH' })
  @ApiParam({
    name: 'code',
    description: 'Código interno da requisição',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Análise do RH registrada com sucesso.',
    type: Requisition,
  })
  analyzeRh(
    @Param('code') code: string,
    @Body() dto: AnalyzeRequisitionRhDto,
    @Req() req: any,
  ) {
    return this.requisitionsService.analyzeRh(code, dto, req.user.sub)
  }

  @Post(':code/analyze/financial')
  @Permissions('write:requisitions')
  @ApiOperation({
    summary:
      'Analisar a requisição pela Direção Administrativa e Financeira (aprovar, aprovar parcialmente ou rejeitar)',
  })
  @ApiParam({
    name: 'code',
    description: 'Código interno da requisição',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Análise financeira registrada com sucesso.',
    type: Requisition,
  })
  analyzeFinancial(
    @Param('code') code: string,
    @Body() dto: AnalyzeRequisitionFinancialDto,
    @Req() req: any,
  ) {
    return this.requisitionsService.analyzeFinancial(code, dto, req.user.sub)
  }
}
