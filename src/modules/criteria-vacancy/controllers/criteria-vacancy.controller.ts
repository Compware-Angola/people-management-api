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

import { CriteriaVacancyService } from '../services/criteria-vacancy.service'
import { CriteriaVacancy } from '../entity/criteria-vacancy.entity'

import { CreateCriteriaVacancyDto } from '../dto/create-criteria-vacancy.dto'
import { UpdateCriteriaVacancyDto } from '../dto/update-criteria-vacancy.dto'
import { ListCriteriaVacancyQueryDto } from '../dto/list-criteria-vacancy-query.dto'

import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'

@ApiTags('Criteria Vacancies')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('criteria-vacancies')
export class CriteriaVacancyController {
  constructor(
    private readonly criteriaVacancyService: CriteriaVacancyService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Associar um critério a uma vaga',
  })
  @ApiResponse({
    status: 201,
    description: 'Critério associado à vaga com sucesso.',
    type: CriteriaVacancy,
  })
  @ApiResponse({
    status: 404,
    description: 'Vaga ou critério não encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'O critério já está associado à vaga.',
  })
  create(@Body() dto: CreateCriteriaVacancyDto) {
    return this.criteriaVacancyService.create(dto)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar critérios associados às vagas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de critérios associados às vagas.',
    type: [CriteriaVacancy],
  })
  findAll(@Query() query: ListCriteriaVacancyQueryDto) {
    return this.criteriaVacancyService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar uma associação de vaga e critério pelo código',
  })
  @ApiParam({
    name: 'id',
    description: 'Código da associação',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Associação encontrada.',
    type: CriteriaVacancy,
  })
  @ApiResponse({
    status: 404,
    description: 'Associação não encontrada.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.criteriaVacancyService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma associação de vaga e critério',
  })
  @ApiParam({
    name: 'id',
    description: 'Código da associação',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Associação atualizada com sucesso.',
    type: CriteriaVacancy,
  })
  @ApiResponse({
    status: 404,
    description: 'Vaga, critério ou associação não encontrada.',
  })
  @ApiResponse({
    status: 409,
    description: 'A combinação da vaga e critério já está associada.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCriteriaVacancyDto,
  ) {
    return this.criteriaVacancyService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover um critério de uma vaga',
  })
  @ApiParam({
    name: 'id',
    description: 'Código da associação',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Critério removido da vaga com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Associação não encontrada.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.criteriaVacancyService.remove(id)
  }
}
