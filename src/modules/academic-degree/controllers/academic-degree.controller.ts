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

import { AcademicDegreeService } from '../services/academic-degree.service'
import { AcademicDegree } from '../entity/academic-degree.entity'

import { CreateAcademicDegreeDto } from '../dto/create-academic-degree.dto'
import { UpdateAcademicDegreeDto } from '../dto/update-academic-degree.dto'
import { ListAcademicDegreeQueryDto } from '../dto/list-academic-degree-query.dto'

import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'
import { Permissions } from 'src/commons/decorators/permissions.decorator'
import { PermissionsEnum } from 'src/commons/enums/permissions.enum'

@ApiTags('Academic Degrees')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('academic-degrees')
export class AcademicDegreeController {
  constructor(private readonly academicDegreeService: AcademicDegreeService) {}

  @Post()
  @Permissions(PermissionsEnum.WRITE_ACADEMIC_DEGREES)
  @ApiOperation({
    summary: 'Criar um novo grau académico',
  })
  @ApiResponse({
    status: 201,
    description: 'Grau acadêmico criado com sucesso.',
    type: AcademicDegree,
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe um grau académico com essa designação ou sigla.',
  })
  create(@Body() dto: CreateAcademicDegreeDto) {
    return this.academicDegreeService.create(dto)
  }

  @Get()
  @Permissions(PermissionsEnum.READ_ACADEMIC_DEGREES)
  @ApiOperation({
    summary: 'Listar graus acadêmicos com paginação, busca e filtros',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de graus académicos.',
    type: [AcademicDegree],
  })
  findAll(@Query() query: ListAcademicDegreeQueryDto) {
    return this.academicDegreeService.findAll(query)
  }

  @Get(':id')
  @Permissions(PermissionsEnum.READ_ACADEMIC_DEGREES)
  @ApiOperation({
    summary: 'Buscar um grau acadêmico pelo código',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do grau académico',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Grau académico encontrado.',
    type: AcademicDegree,
  })
  @ApiResponse({
    status: 404,
    description: 'Grau académico não encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicDegreeService.findOne(id)
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.WRITE_ACADEMIC_DEGREES)
  @ApiOperation({
    summary: 'Atualizar um grau acadêmico',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do grau acadêmico',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Grau acadêmico atualizado com sucesso.',
    type: AcademicDegree,
  })
  @ApiResponse({
    status: 404,
    description: 'Grau acadêmico não encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe outro grau acadêmico com essa designação ou sigla.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicDegreeDto,
  ) {
    return this.academicDegreeService.update(id, dto)
  }

  @Delete(':id')
  @Permissions(PermissionsEnum.WRITE_ACADEMIC_DEGREES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover um grau acadêmico',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do grau acadêmico',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Grau acadêmico removido com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Grau acadêmico não encontrado.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicDegreeService.remove(id)
  }
}
