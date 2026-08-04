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
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { DepartmentsService } from '../services/department.service'
import { Department } from '../entity/department.entity'
import { CreateDepartmentDto } from '../dto/create-department.dto'
import { ListDepartmentsQueryDto } from '../dto/list-departments-query.dto'
import { UpdateDepartmentDto } from '../dto/update-department.dto'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo departamento' })
  @ApiResponse({
    status: 201,
    description: 'Departamento criado com sucesso.',
    type: Department,
  })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto)
  }

  @Get()
  @ApiOperation({
    summary: 'Listar departamentos (com paginação, busca e filtro por status)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de departamentos.',
    type: [Department],
  })
  findAll(@Query() query: ListDepartmentsQueryDto) {
    return this.departmentsService.findAll(query)
  }

  @Get('my')
@ApiOperation({ summary: 'Buscar um departamento pelo código' })
  @ApiResponse({
    status: 200,
    description: 'Departamento encontrado.',
    type: [Department],
  })
  myDepartments(@Req() req: any) {
    return this.departmentsService.myDepartment(req.user.sub)
  }
  
  @Get(':code')
  @ApiOperation({ summary: 'Buscar um departamento pelo código' })
  @ApiParam({ name: 'code', description: 'Código do departamento', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Departamento encontrado.',
    type: Department,
  })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado.' })
  findOne(@Param('code', ParseIntPipe) code: number) {
    return this.departmentsService.findOne(code)
  }

  @Patch(':code')
  @ApiOperation({ summary: 'Atualizar um departamento' })
  @ApiParam({ name: 'code', description: 'Código do departamento', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Departamento atualizado com sucesso.',
    type: Department,
  })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado.' })
  update(
    @Param('code', ParseIntPipe) code: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(code, dto)
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um departamento' })
  @ApiParam({ name: 'code', description: 'Código do departamento', example: 1 })
  @ApiResponse({
    status: 204,
    description: 'Departamento removido com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado.' })
  remove(@Param('code', ParseIntPipe) code: number) {
    return this.departmentsService.remove(code)
  }
}
