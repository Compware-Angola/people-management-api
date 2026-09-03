import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
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
import { DecodedUserPayload } from 'src/commons/guards/remote-jwt-auth.guard'

import { InterviewScheduleService } from '../services/interview-schedule.service'
import { CreateInterviewScheduleDto } from '../dto/create-interview-schedule.dto'
import { UpdateInterviewScheduleDto } from '../dto/update-interview-schedule.dto'
import { ListInterviewScheduleQueryDto } from '../dto/list-interview-schedule-query.dto'
import { SetInterviewersDto } from '../dto/set-interviewers.dto'

@ApiTags('Interview Schedules')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('interview-schedules')
export class InterviewScheduleController {
  constructor(
    private readonly interviewScheduleService: InterviewScheduleService,
  ) {}

  @Post()
  @Permissions(PermissionsEnum.WRITE_INTERVIEW_SCHEDULES)
  @ApiOperation({ summary: 'Criar um agendamento de entrevista' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Modalidade, estado ou candidatura inválidos.',
  })
  create(
    @Body() dto: CreateInterviewScheduleDto,
    @Req() req: { user: DecodedUserPayload },
  ) {
    return this.interviewScheduleService.create(dto, req.user?.sub ?? null)
  }

  @Get()
  @Permissions(PermissionsEnum.READ_INTERVIEW_SCHEDULES)
  @ApiOperation({
    summary: 'Listar agendamentos de entrevista com paginação, busca e filtros',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de agendamentos de entrevista.',
  })
  findAll(@Query() query: ListInterviewScheduleQueryDto) {
    return this.interviewScheduleService.findAll(query)
  }

  @Get(':id')
  @Permissions(PermissionsEnum.READ_INTERVIEW_SCHEDULES)
  @ApiOperation({ summary: 'Buscar um agendamento de entrevista pelo código' })
  @ApiParam({ name: 'id', description: 'Código do agendamento', example: 1 })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.interviewScheduleService.findOne(id)
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.WRITE_INTERVIEW_SCHEDULES)
  @ApiOperation({ summary: 'Atualizar um agendamento de entrevista' })
  @ApiParam({ name: 'id', description: 'Código do agendamento', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Agendamento atualizado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInterviewScheduleDto,
  ) {
    return this.interviewScheduleService.update(id, dto)
  }

  @Delete(':id')
  @Permissions(PermissionsEnum.WRITE_INTERVIEW_SCHEDULES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um agendamento de entrevista' })
  @ApiParam({ name: 'id', description: 'Código do agendamento', example: 1 })
  @ApiResponse({
    status: 204,
    description: 'Agendamento removido com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.interviewScheduleService.remove(id)
  }

  @Put(':id/interviewers')
  @Permissions(PermissionsEnum.WRITE_INTERVIEW_SCHEDULES)
  @ApiOperation({
    summary: 'Substituir a lista de entrevistadores do agendamento',
  })
  @ApiParam({ name: 'id', description: 'Código do agendamento', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lista de entrevistadores atualizada.',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  setInterviewers(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetInterviewersDto,
  ) {
    return this.interviewScheduleService.setInterviewers(id, dto.userIds)
  }

  @Post(':id/interviewers/:userId')
  @Permissions(PermissionsEnum.WRITE_INTERVIEW_SCHEDULES)
  @ApiOperation({ summary: 'Adicionar um entrevistador ao agendamento' })
  @ApiParam({ name: 'id', description: 'Código do agendamento', example: 1 })
  @ApiParam({ name: 'userId', description: 'Código do utilizador', example: 2 })
  @ApiResponse({ status: 201, description: 'Entrevistador adicionado.' })
  @ApiResponse({
    status: 409,
    description: 'O utilizador já é entrevistador deste agendamento.',
  })
  addInterviewer(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.interviewScheduleService.addInterviewer(id, userId)
  }

  @Delete(':id/interviewers/:userId')
  @Permissions(PermissionsEnum.WRITE_INTERVIEW_SCHEDULES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um entrevistador do agendamento' })
  @ApiParam({ name: 'id', description: 'Código do agendamento', example: 1 })
  @ApiParam({ name: 'userId', description: 'Código do utilizador', example: 2 })
  @ApiResponse({ status: 204, description: 'Entrevistador removido.' })
  @ApiResponse({
    status: 404,
    description: 'O utilizador não é entrevistador deste agendamento.',
  })
  removeInterviewer(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.interviewScheduleService.removeInterviewer(id, userId)
  }
}
