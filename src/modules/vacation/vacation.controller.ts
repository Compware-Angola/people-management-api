import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common'
import { VacationService } from './vacation.service'
import { CreateVacationDto } from './dto/create-vacation.dto'
import { UpdateVacationDto } from './dto/update-vacation.dto'
import { VacationQueryDto } from './dto/vacation-query.dto'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RemoteJwtAuthGuard } from '../../commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from '../../commons/guards/permissions.guard'
import { Permissions } from '../../commons/decorators/permissions.decorator'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'

@Controller('vacations')
@ApiTags('Vacations')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @Post()
  @Permissions(PermissionsEnum.WRITE_VACATIONS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Solicitar férias' })
  async create(@Body() dto: CreateVacationDto) {
    await this.vacationService.create(dto)
  }

  @Get()
  @Permissions(PermissionsEnum.READ_VACATIONS)
  @ApiOperation({ summary: 'Listar todas as férias' })
  findAll(@Query() query: VacationQueryDto) {
    return this.vacationService.findAll(query)
  }

  @Get(':id')
  @Permissions(PermissionsEnum.READ_VACATIONS)
  @ApiOperation({ summary: 'Obter detalhes de um registro de férias' })
  findOne(@Param('id') id: string) {
    return this.vacationService.findOne(+id)
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.WRITE_VACATIONS)
  @ApiOperation({ summary: 'Atualizar registro de férias' })
  update(@Param('id') id: string, @Body() dto: UpdateVacationDto) {
    return this.vacationService.update(+id, dto)
  }

  @Delete(':id')
  @Permissions(PermissionsEnum.WRITE_VACATIONS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir registro de férias' })
  async remove(@Param('id') id: string) {
    await this.vacationService.remove(+id)
  }
}
