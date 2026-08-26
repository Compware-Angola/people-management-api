import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { VacancyStatesService } from '../services/vacancy-states.service'
import { VacancyState } from '../entity/vacancy-state.entity'
import { ListVacancyStatesQueryDto } from '../dto/list-vacancy-states-query.dto'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'
import { Permissions } from 'src/commons/decorators/permissions.decorator'
import { PermissionsEnum } from 'src/commons/enums/permissions.enum'

@ApiTags('Vacancy States')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('vacancy-states')
export class VacancyStatesController {
  constructor(private readonly vacancyStatesService: VacancyStatesService) {}

  @Get()
  @Permissions(PermissionsEnum.READ_VACANCY_STATES)
  @ApiOperation({
    summary:
      'Listar estados de vaga (seed por regra de negócio; com paginação e busca)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de estados de vaga.',
    type: [VacancyState],
  })
  findAll(@Query() query: ListVacancyStatesQueryDto) {
    return this.vacancyStatesService.findAll(query)
  }

  @Get(':code')
  @Permissions(PermissionsEnum.READ_VACANCY_STATES)
  @ApiOperation({ summary: 'Buscar um estado de vaga pelo código' })
  @ApiParam({
    name: 'code',
    description: 'Código do estado de vaga',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de vaga encontrado.',
    type: VacancyState,
  })
  @ApiResponse({ status: 404, description: 'Estado de vaga não encontrado.' })
  findOne(@Param('code', ParseIntPipe) code: number) {
    return this.vacancyStatesService.findOne(code)
  }
}
