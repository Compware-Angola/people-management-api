import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'
import { Permissions } from 'src/commons/decorators/permissions.decorator'
import { PermissionsEnum } from 'src/commons/enums/permissions.enum'

import { InterviewScheduleStateService } from '../services/interview-schedule-state.service'
import { ListLookupQueryDto } from '../dto/list-lookup-query.dto'

@ApiTags('Interview Schedule States')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('interview-schedule-states')
export class InterviewScheduleStateController {
  constructor(
    private readonly interviewScheduleStateService: InterviewScheduleStateService,
  ) {}

  @Get()
  @Permissions(PermissionsEnum.READ_INTERVIEW_SCHEDULES)
  @ApiOperation({ summary: 'Listar estados de agendamento de entrevista' })
  @ApiResponse({ status: 200, description: 'Lista paginada de estados.' })
  findAll(@Query() query: ListLookupQueryDto) {
    return this.interviewScheduleStateService.findAll(query)
  }

  @Get(':id')
  @Permissions(PermissionsEnum.READ_INTERVIEW_SCHEDULES)
  @ApiOperation({ summary: 'Buscar um estado pelo código' })
  @ApiParam({ name: 'id', description: 'Código do estado', example: 1 })
  @ApiResponse({ status: 200, description: 'Estado encontrado.' })
  @ApiResponse({ status: 404, description: 'Estado não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.interviewScheduleStateService.findOne(id)
  }
}
