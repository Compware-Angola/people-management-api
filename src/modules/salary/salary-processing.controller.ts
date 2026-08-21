import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
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
import { SalaryProcessingService } from './salary-processing.service'
import {
  CreateSalaryProcessingDto,
  SalaryProcessingQueryDto,
  ValidateSalaryProcessingDto,
} from './dto/salary-processing.dto'

@ApiTags('Processamentos Salariais')
@ApiBearerAuth()
@Controller('salary-processing')
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class SalaryProcessingController {
  constructor(private readonly service: SalaryProcessingService) {}

  @Post()
  @Permissions('write:salary-processing')
  @ApiOperation({
    summary: 'Processar (simular) a folha salarial de um período',
  })
  async process(@Body() createDto: CreateSalaryProcessingDto, @Req() req: any) {
    const responsibleEmployeeId = req.user.sub
    return await this.service.process(createDto, responsibleEmployeeId)
  }

  @Get()
  @Permissions('read:salary-processing')
  @ApiOperation({ summary: 'Listar processamentos salariais com filtros' })
  findAll(@Query() query: SalaryProcessingQueryDto) {
    return this.service.findAll(query)
  }

  @Get(':id')
  @Permissions('read:salary-processing')
  @ApiOperation({
    summary: 'Detalhar um processamento salarial, com totais por colaborador',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Patch(':id/validate')
  @Permissions('write:salary-processing')
  @ApiOperation({
    summary: 'Validar um processamento salarial (fechar ou recusar)',
  })
  validate(
    @Param('id', ParseIntPipe) id: number,
    @Body() validateDto: ValidateSalaryProcessingDto,
    @Req() req: any,
  ) {
    const validatorEmployeeId = req.user.sub
    return this.service.validate(id, validateDto, validatorEmployeeId)
  }

  @Post(':id/reprocess')
  @Permissions('write:salary-processing')
  @ApiOperation({
    summary:
      'Cancelar um processamento fechado e gerar um novo para o mesmo período',
  })
  reprocess(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const responsibleEmployeeId = req.user.sub
    return this.service.reprocess(id, responsibleEmployeeId)
  }
}
