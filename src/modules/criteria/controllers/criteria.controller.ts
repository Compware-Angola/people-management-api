import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { CriteriaService } from '../services/criteria.service'
import { Criteria } from '../entity/criteria.entity'

import { CreateCriteriaDto } from '../dto/create-criteria.dto'
import { UpdateCriteriaDto } from '../dto/update-criteria.dto'
import { ListCriteriaQueryDto } from '../dto/list-criteria-query.dto'

import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'

@ApiTags('Criteria')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('criteria')
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar um novo critério',
  })
  @ApiResponse({
    status: 201,
    description: 'Critério criado com sucesso.',
    type: Criteria,
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe um critério com essa descrição.',
  })
  create(@Body() dto: CreateCriteriaDto) {
    return this.criteriaService.create(dto)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar critérios com paginação, busca e filtros',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de critérios.',
    type: [Criteria],
  })
  findAll(@Query() query: ListCriteriaQueryDto) {
    return this.criteriaService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar um critério pelo código',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do critério',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Critério encontrado.',
    type: Criteria,
  })
  @ApiResponse({
    status: 404,
    description: 'Critério não encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.criteriaService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um critério',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do critério',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Critério atualizado com sucesso.',
    type: Criteria,
  })
  @ApiResponse({
    status: 404,
    description: 'Critério não encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe um critério com essa descrição.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCriteriaDto,
  ) {
    return this.criteriaService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover um critério',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do critério',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Critério removido com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Critério não encontrado.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.criteriaService.remove(id)
  }
}
