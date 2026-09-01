import { Controller, Get, Param, UseGuards } from '@nestjs/common'
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

import { ScreeningService } from '../services/screening.service'
import { VacancyScreeningResultDto } from '../dto/screening-result.dto'

@ApiTags('Screening')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('vacancies')
export class ScreeningController {
  constructor(private readonly screeningService: ScreeningService) {}

  @Get(':code/screening')
  @Permissions(PermissionsEnum.READ_VACANCIES)
  @ApiOperation({
    summary: 'Calcular a triagem (ranking) dos candidatos de uma vaga',
  })
  @ApiParam({
    name: 'code',
    description: 'Código público da vaga',
    example: 'VAG-2026-000003',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking dos candidatos da vaga.',
    type: VacancyScreeningResultDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Vaga sem critérios configurados ou com soma de pesos diferente de 100.',
  })
  @ApiResponse({
    status: 404,
    description: 'Vaga não encontrada.',
  })
  screen(@Param('code') code: string): Promise<VacancyScreeningResultDto> {
    return this.screeningService.screenByVacancyCode(code)
  }
}
