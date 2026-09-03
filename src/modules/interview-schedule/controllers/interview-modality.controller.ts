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

import { InterviewModalityService } from '../services/interview-modality.service'
import { ListLookupQueryDto } from '../dto/list-lookup-query.dto'

@ApiTags('Interview Modalities')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('interview-modalities')
export class InterviewModalityController {
  constructor(
    private readonly interviewModalityService: InterviewModalityService,
  ) {}

  @Get()
  @Permissions(PermissionsEnum.READ_INTERVIEW_SCHEDULES)
  @ApiOperation({ summary: 'Listar modalidades de entrevista' })
  @ApiResponse({ status: 200, description: 'Lista paginada de modalidades.' })
  findAll(@Query() query: ListLookupQueryDto) {
    return this.interviewModalityService.findAll(query)
  }

  @Get(':id')
  @Permissions(PermissionsEnum.READ_INTERVIEW_SCHEDULES)
  @ApiOperation({ summary: 'Buscar uma modalidade pelo código' })
  @ApiParam({ name: 'id', description: 'Código da modalidade', example: 1 })
  @ApiResponse({ status: 200, description: 'Modalidade encontrada.' })
  @ApiResponse({ status: 404, description: 'Modalidade não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.interviewModalityService.findOne(id)
  }
}
