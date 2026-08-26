import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Delete,
  UseGuards,
} from '@nestjs/common'
import { EmployeeService } from './employee.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { EmployeeQueryDto } from './dto/employee-query.dto'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CreateFileDto } from './dto/file/create-file.dto'
import { RemoteJwtAuthGuard } from '../../commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from '../../commons/guards/permissions.guard'
import { Permissions } from '../../commons/decorators/permissions.decorator'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'

@Controller('employees')
@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(PermissionsEnum.WRITE_EMPLOYEES)
  @ApiOperation({ summary: 'Criar um novo colaborador' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os colaboradores' })
  @Permissions(PermissionsEnum.READ_EMPLOYEES)
  findAll(@Query() query: EmployeeQueryDto) {
    return this.employeeService.findAll(query)
  }

  @Get(':id')
  @Permissions(PermissionsEnum.READ_EMPLOYEES)
  @ApiOperation({ summary: 'Buscar um colaborador pelo ID' })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id)
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.WRITE_EMPLOYEES)
  @ApiOperation({ summary: 'Atualizar um colaborador' })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(+id, updateEmployeeDto)
  }

  @Post('files')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(PermissionsEnum.WRITE_EMPLOYEES)
  @ApiOperation({ summary: 'Adicionar arquivo ao colaborador' })
  async addFile(@Body() createFileDto: CreateFileDto) {
    return this.employeeService.addFile(createFileDto)
  }

  @Delete('files/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(PermissionsEnum.WRITE_EMPLOYEES)
  @ApiOperation({ summary: 'Remover arquivo do colaborador' })
  async removeFile(@Param('id') id: string) {
    await this.employeeService.removeFile(+id)
  }
}
