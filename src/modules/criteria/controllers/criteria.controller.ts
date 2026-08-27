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
import { Permissions } from 'src/commons/decorators/permissions.decorator'
import { PermissionsEnum } from 'src/commons/enums/permissions.enum'

@ApiTags('Criteria')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('criteria')
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}

  @Post()
  @Permissions(PermissionsEnum.WRITE_CRITERIA)
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
  @Permissions(PermissionsEnum.READ_CRITERIA)
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
  @Permissions(PermissionsEnum.READ_CRITERIA)
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
  @Permissions(PermissionsEnum.WRITE_CRITERIA)
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
  @Permissions(PermissionsEnum.WRITE_CRITERIA)
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
