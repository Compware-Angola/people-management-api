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
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { HiringTypesService } from '../services/hiring-types.service'
import { HiringType } from '../entity/hiring-type.entity'
import { CreateHiringTypeDto } from '../dto/create-hiring-type.dto'
import { ListHiringTypesQueryDto } from '../dto/list-hiring-types-query.dto'
import { UpdateHiringTypeDto } from '../dto/update-hiring-type.dto'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'

@ApiTags('Hiring Types')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('hiring-types')
export class HiringTypesController {
  constructor(private readonly hiringTypesService: HiringTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo tipo de contratação' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de contratação criado com sucesso.',
    type: HiringType,
  })
  create(@Body() dto: CreateHiringTypeDto) {
    return this.hiringTypesService.create(dto)
  }

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

  @Patch(':code')
  @ApiOperation({ summary: 'Atualizar um tipo de contratação' })
  @ApiParam({
    name: 'code',
    description: 'Código do tipo de contratação',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de contratação atualizado com sucesso.',
    type: HiringType,
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de contratação não encontrado.',
  })
  update(
    @Param('code', ParseIntPipe) code: number,
    @Body() dto: UpdateHiringTypeDto,
  ) {
    return this.hiringTypesService.update(code, dto)
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um tipo de contratação' })
  @ApiParam({
    name: 'code',
    description: 'Código do tipo de contratação',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Tipo de contratação removido com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de contratação não encontrado.',
  })
  remove(@Param('code', ParseIntPipe) code: number) {
    return this.hiringTypesService.remove(code)
  }
}
