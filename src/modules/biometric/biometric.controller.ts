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
} from '@nestjs/common'
import { BiometricService } from './biometric.service'
import { CreateEquipmentDto } from './dto/equipment/create-equipment.dto'
import { UpdateEquipmentDto } from './dto/equipment/update-equipment.dto'
import { CreateBiometricIntegrationDto } from './dto/integration/create-biometric-integration.dto'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PaginationQueryDto } from '../../commons/dto/pagination.dto'

@Controller('biometrics')
@ApiTags('Biometrics')
export class BiometricController {
  constructor(private readonly biometricService: BiometricService) {}

  // --- Equipamentos ---

  @Post('equipments')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cadastrar novo equipamento' })
  async createEquipment(@Body() dto: CreateEquipmentDto) {
    await this.biometricService.createEquipment(dto)
  }

  @Get('equipments')
  @ApiOperation({ summary: 'Listar todos os equipamentos' })
  findAllEquipments(@Query() query: PaginationQueryDto) {
    return this.biometricService.findAllEquipments(query)
  }

  @Get('equipments/:id')
  @ApiOperation({ summary: 'Obter detalhes de um equipamento' })
  findOneEquipment(@Param('id') id: string) {
    return this.biometricService.findOneEquipment(+id)
  }

  @Patch('equipments/:id')
  @ApiOperation({ summary: 'Atualizar dados de um equipamento' })
  updateEquipment(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.biometricService.updateEquipment(+id, dto)
  }

  // --- Integrações ---

  @Post('integrations')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Registrar evento biométrico' })
  async createIntegration(@Body() dto: CreateBiometricIntegrationDto) {
    await this.biometricService.createIntegration(dto)
  }

  @Get('integrations')
  @ApiOperation({ summary: 'Listar todos os eventos biométricos' })
  findAllIntegrations(@Query() query: PaginationQueryDto) {
    return this.biometricService.findAllIntegrations(query)
  }

  @Get('integrations/employee/:employeeId')
  @ApiOperation({ summary: 'Listar eventos biométricos por colaborador' })
  findIntegrationsByEmployee(@Param('employeeId') employeeId: string) {
    return this.biometricService.findIntegrationsByEmployee(+employeeId)
  }
}
