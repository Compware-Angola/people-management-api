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
  UseGuards,
} from '@nestjs/common'
import { BiometricService } from './biometric.service'
import { CreateEquipmentDto } from './dto/equipment/create-equipment.dto'
import { UpdateEquipmentDto } from './dto/equipment/update-equipment.dto'
import { CreateBiometricIntegrationDto } from './dto/integration/create-biometric-integration.dto'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PaginationQueryDto } from '../../commons/dto/pagination.dto'
import { RemoteJwtAuthGuard } from '../../commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from '../../commons/guards/permissions.guard'
import { Permissions } from '../../commons/decorators/permissions.decorator'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'

@Controller('biometrics')
@ApiTags('Biometrics')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class BiometricController {
  constructor(private readonly biometricService: BiometricService) {}

  // --- Equipamentos ---

  @Post('equipments')
  @Permissions(PermissionsEnum.WRITE_BIOMETRICS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cadastrar novo equipamento' })
  async createEquipment(@Body() dto: CreateEquipmentDto) {
    await this.biometricService.createEquipment(dto)
  }

  @Get('equipments')
  @Permissions(PermissionsEnum.READ_BIOMETRICS)
  @ApiOperation({ summary: 'Listar todos os equipamentos' })
  findAllEquipments(@Query() query: PaginationQueryDto) {
    return this.biometricService.findAllEquipments(query)
  }

  @Get('equipments/:id')
  @Permissions(PermissionsEnum.READ_BIOMETRICS)
  @ApiOperation({ summary: 'Obter detalhes de um equipamento' })
  findOneEquipment(@Param('id') id: string) {
    return this.biometricService.findOneEquipment(+id)
  }

  @Patch('equipments/:id')
  @Permissions(PermissionsEnum.WRITE_BIOMETRICS)
  @ApiOperation({ summary: 'Atualizar dados de um equipamento' })
  updateEquipment(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.biometricService.updateEquipment(+id, dto)
  }

  // --- Integrações ---

  @Post('integrations')
  @Permissions(PermissionsEnum.WRITE_BIOMETRICS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Registrar evento biométrico' })
  async createIntegration(@Body() dto: CreateBiometricIntegrationDto) {
    await this.biometricService.createIntegration(dto)
  }

  @Get('integrations')
  @Permissions(PermissionsEnum.READ_BIOMETRICS)
  @ApiOperation({ summary: 'Listar todos os eventos biométricos' })
  findAllIntegrations(@Query() query: PaginationQueryDto) {
    return this.biometricService.findAllIntegrations(query)
  }

  @Get('integrations/employee/:employeeId')
  @Permissions(PermissionsEnum.READ_BIOMETRICS)
  @ApiOperation({ summary: 'Listar eventos biométricos por colaborador' })
  findIntegrationsByEmployee(@Param('employeeId') employeeId: string) {
    return this.biometricService.findIntegrationsByEmployee(+employeeId)
  }
}
