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
import { PositionsService } from '../services/positions.service'
import { Position } from '../entity/position.entity'
import { CreatePositionDto } from '../dto/create-position.dto'
import { ListPositionsQueryDto } from '../dto/list-positions-query.dto'
import { UpdatePositionDto } from '../dto/update-position.dto'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'

@ApiTags('Positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}
  @Post()
  @ApiBearerAuth()
  @UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Criar um novo cargo' })
  @ApiResponse({
    status: 201,
    description: 'Cargo criado com sucesso.',
    type: Position,
  })
  create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar cargos (com paginação, busca e filtro por status)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de cargos.',
    type: [Position],
  })
  findAll(@Query() query: ListPositionsQueryDto) {
    return this.positionsService.findAll(query)
  }

  @Get(':code')
  @ApiOperation({ summary: 'Buscar um cargo pelo código' })
  @ApiParam({ name: 'code', description: 'Código do cargo', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cargo encontrado.',
    type: Position,
  })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado.' })
  findOne(@Param('code', ParseIntPipe) code: number) {
    return this.positionsService.findOne(code)
  }

  @Patch(':code')
  @ApiBearerAuth()
  @UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Atualizar um cargo' })
  @ApiParam({ name: 'code', description: 'Código do cargo', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cargo atualizado com sucesso.',
    type: Position,
  })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado.' })
  update(
    @Param('code', ParseIntPipe) code: number,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.positionsService.update(code, dto)
  }

  @Delete(':code')
  @ApiBearerAuth()
  @UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um cargo' })
  @ApiParam({ name: 'code', description: 'Código do cargo', example: 1 })
  @ApiResponse({ status: 204, description: 'Cargo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Cargo não encontrado.' })
  remove(@Param('code', ParseIntPipe) code: number) {
    return this.positionsService.remove(code)
  }
}
