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
import { VacancyRequestTypeService } from '../services/vacancy-request-type.service'
import { VacancyRequestType } from '../entity/vacancy-request-type.entity'
import { CreateVacancyRequestTypeDto } from '../dto/create-vacancy-request-type.dto'
import { UpdateVacancyRequestTypeDto } from '../dto/update-vacancy-request-type.dto'
import { ListVacancyRequestTypeQueryDto } from '../dto/list-vacancy-request-type-query.dto'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'

@ApiTags('Vacancy Request Types')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('vacancy-request-types')
export class VacancyRequestTypeController {
  constructor(
    private readonly vacancyRequestTypeService: VacancyRequestTypeService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar um novo tipo de requisição de vaga',
  })
  @ApiResponse({
    status: 201,
    description: 'Tipo de requisição criado com sucesso.',
    type: VacancyRequestType,
  })
  @ApiResponse({
    status: 409,
    description: 'A sigla ou descrição já está sendo utilizada.',
  })
  create(@Body() dto: CreateVacancyRequestTypeDto) {
    return this.vacancyRequestTypeService.create(dto)
  }

  @Get()
  @ApiOperation({
    summary:
      'Listar tipos de requisição de vaga com paginação, busca e filtros',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de tipos de requisição de vaga.',
    type: [VacancyRequestType],
  })
  findAll(@Query() query: ListVacancyRequestTypeQueryDto) {
    return this.vacancyRequestTypeService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar um tipo de requisição de vaga pelo código',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do tipo de requisição',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de requisição encontrado.',
    type: VacancyRequestType,
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de requisição não encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vacancyRequestTypeService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um tipo de requisição de vaga',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do tipo de requisição',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de requisição atualizado com sucesso.',
    type: VacancyRequestType,
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de requisição não encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'A sigla ou descrição já está sendo utilizada.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVacancyRequestTypeDto,
  ) {
    return this.vacancyRequestTypeService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover um tipo de requisição de vaga',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do tipo de requisição',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Tipo de requisição removido com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de requisição não encontrado.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vacancyRequestTypeService.remove(id)
  }
}
