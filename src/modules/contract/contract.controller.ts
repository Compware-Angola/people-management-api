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
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RemoteJwtAuthGuard } from '../../commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from '../../commons/guards/permissions.guard'
import { Permissions } from '../../commons/decorators/permissions.decorator'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'
import { ContractService } from './contract.service'
import {
  ContractQueryDto,
  CreateContractDto,
  UpdateContractDto,
} from './dto/contract.dto'
import { CreateContractEmployeeDto } from './dto/contract-employee.dto'

@ApiTags('Contratos')
@ApiBearerAuth()
@Controller('contracts')
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class ContractController {
  constructor(private readonly service: ContractService) {}

  @Post()
  @Permissions(PermissionsEnum.WRITE_CONTRACTS)
  @ApiOperation({ summary: 'Registrar contrato' })
  create(@Body() createDto: CreateContractDto) {
    return this.service.create(createDto)
  }

  @Get()
  @Permissions(PermissionsEnum.READ_CONTRACTS)
  @ApiOperation({ summary: 'Listar contratos com filtros' })
  findAll(@Query() query: ContractQueryDto) {
    return this.service.findAll(query)
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.WRITE_CONTRACTS)
  @ApiOperation({ summary: 'Atualizar um contrato' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateContractDto,
  ) {
    return this.service.update(id, updateDto)
  }

  @Post('employees')
  @Permissions(PermissionsEnum.WRITE_CONTRACTS)
  @ApiOperation({ summary: 'Associar contrato a um colaborador' })
  saveContractToEmployee(@Body() createDto: CreateContractEmployeeDto) {
    return this.service.saveContractToEmployee(createDto)
  }

  @Get('employees/:id')
  @Permissions(PermissionsEnum.READ_CONTRACTS)
  @ApiOperation({ summary: 'Buscar o contrato ativo do colaborador' })
  findContractEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.service.findContractEmployeeByEmployeeId(id)
  }

  @Get('employees/:id/history')
  @Permissions(PermissionsEnum.READ_CONTRACTS)
  @ApiOperation({ summary: 'Listar o histórico de contratos do colaborador' })
  findContractEmployeeHistory(@Param('id', ParseIntPipe) id: number) {
    return this.service.findHistory(id)
  }
}
