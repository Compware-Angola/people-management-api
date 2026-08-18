import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RemoteJwtAuthGuard } from '../../commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from '../../commons/guards/permissions.guard'
import { Permissions } from '../../commons/decorators/permissions.decorator'
import { SalaryService } from './salary.service'
import {
  CreateSalaryDto,
  SalaryQueryDto,
  UpdateSalaryDto,
} from './dto/salary.dto'
import { CreateSalaryEmployeeDto } from './dto/salary-employee.dto'
import { CreateRubricDto } from './dto/rubric.dto'
import { CreateSalaryRubricDto } from './dto/salary-rubric.dto'

@ApiTags('Salários')
@ApiBearerAuth()
@Controller('salaries')
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class SalaryController {
  constructor(private readonly service: SalaryService) {}

  @Post()
  @Permissions('write:salaries')
  @ApiOperation({ summary: 'Registrar salário' })
  create(@Body() create: CreateSalaryDto) {
    return this.service.create(create)
  }

  @Get()
  @Permissions('read:salaries')
  @ApiOperation({ summary: 'Listar salários com filtros' })
  findAll(@Query() query: SalaryQueryDto) {
    return this.service.findAll(query)
  }

  @Patch(':id')
  @Permissions('write:salaries')
  @ApiOperation({ summary: 'Atualizar um salário' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() update: UpdateSalaryDto,
  ) {
    return this.service.update(id, update)
  }

  @Post('employees')
  @Permissions('write:salaries')
  @ApiOperation({ summary: 'Adicionar colaborador a uma estrutura salarial' })
  saveSalaryToEmployee(
    @Body() createSalaryEmployeeDto: CreateSalaryEmployeeDto,
    @Req() req: any,
  ) {
    const createdByEmployeeId = req.user.sub
    return this.service.saveSalaryToEmployee(
      createSalaryEmployeeDto,
      createdByEmployeeId,
    )
  }

  @Get('employees/:id')
  @Permissions('read:salaries')
  @ApiOperation({ summary: 'Buscar a estrutura salarial ativa do colaborador' })
  findSalaryEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.service.findSalaryEmployeeByEmployeeId(id)
  }

  @Get('employees/:id/history')
  @Permissions('read:salaries')
  @ApiOperation({
    summary: 'Listar o histórico de estruturas salariais do colaborador',
  })
  findSalaryEmployeeHistory(@Param('id', ParseIntPipe) id: number) {
    return this.service.findSalaryEmployeeHistory(id)
  }

  @Get('rubrics/:id')
  @Permissions('read:salaries')
  @ApiOperation({
    summary: 'Buscar estrutura salarial por código, com as rubricas associadas',
  })
  findSalaryStructureWithRubrics(@Param('id', ParseIntPipe) id: number) {
    return this.service.findSalaryStructureWithRubrics(id)
  }

  @Post('rubrics')
  @Permissions('write:salaries')
  @ApiOperation({ summary: 'Criar rubrica' })
  createRubric(@Body() createRubricDto: CreateRubricDto) {
    return this.service.createRubric(createRubricDto)
  }

  @Post('rubrics/associate')
  @Permissions('write:salaries')
  @ApiOperation({ summary: 'Associar rubrica a uma estrutura salarial' })
  associateRubricToStructure(
    @Body() createSalaryRubricDto: CreateSalaryRubricDto,
    @Req() req: any,
  ) {
    const createdByEmployeeCode = req.user.sub
    return this.service.associateRubricToStructure(
      createSalaryRubricDto,
      createdByEmployeeCode,
    )
  }
}
