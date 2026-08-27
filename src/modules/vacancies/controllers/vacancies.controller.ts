import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { VacanciesService } from '../services/vacancies.service'
import { Vacancy } from '../entity/vacancy.entity'
import { CreateVacancyDto } from '../dto/create-vacancy.dto'
import { UpdateVacancyDto } from '../dto/update-vacancy.dto'
import { ListVacanciesQueryDto } from '../dto/list-vacancies-query.dto'
import { VacancyActionDto } from '../dto/vacancy-action.dto'
import { UploadVacancyDocumentDto } from '../dto/upload-vacancy-document.dto'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'
import { Permissions } from 'src/commons/decorators/permissions.decorator'
import { PermissionsEnum } from 'src/commons/enums/permissions.enum'

@ApiTags('Vacancies')
@ApiBearerAuth()
@Controller('vacancies')
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Post()
  @Permissions(PermissionsEnum.WRITE_VACANCIES)
  @ApiOperation({
    summary: 'Cadastrar uma vaga a partir de uma requisição aprovada',
  })
  @ApiResponse({
    status: 201,
    description: 'Vaga criada com sucesso.',
    type: Vacancy,
  })
  create(@Body() dto: CreateVacancyDto, @Req() req: any) {
    return this.vacanciesService.create(dto, req.user.sub)
  }

  @Get()
  @Permissions(PermissionsEnum.READ_VACANCIES)
  @ApiOperation({
    summary: 'Listar vagas (com paginação, busca pelo código e filtros)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de vagas.',
    type: [Vacancy],
  })
  findAll(@Query() query: ListVacanciesQueryDto) {
    return this.vacanciesService.findAll(query)
  }

  @Get(':code')
  @Permissions(PermissionsEnum.READ_VACANCIES)
  @ApiOperation({ summary: 'Buscar uma vaga pelo código' })
  @ApiParam({
    name: 'code',
    description: 'Código da vaga',
    example: 'VAG-2026-000001',
  })
  @ApiResponse({
    status: 200,
    description: 'Vaga encontrada com documentos e histórico.',
    type: Vacancy,
  })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada.' })
  findOne(@Param('code') code: string) {
    return this.vacanciesService.findOneByCode(code)
  }

  @Patch(':code')
  @Permissions(PermissionsEnum.WRITE_VACANCIES)
  @ApiOperation({ summary: 'Editar uma vaga (apenas antes da publicação)' })
  @ApiParam({
    name: 'code',
    description: 'Código da vaga',
    example: 'VAG-2026-000001',
  })
  @ApiResponse({
    status: 200,
    description: 'Vaga atualizada com sucesso.',
    type: Vacancy,
  })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada.' })
  update(
    @Param('code') code: string,
    @Body() dto: UpdateVacancyDto,
    @Req() req: any,
  ) {
    return this.vacanciesService.update(code, dto, req.user.sub)
  }

  @Post(':code/documents')
  @Permissions(PermissionsEnum.WRITE_VACANCIES)
  @ApiOperation({
    summary:
      'Registar documento da vaga (ex.: Edital de Contratação) a partir de um ficheiro já enviado ao storage',
  })
  @ApiParam({
    name: 'code',
    description: 'Código da vaga',
    example: 'VAG-2026-000001',
  })
  @ApiResponse({
    status: 201,
    description: 'Documento anexado com sucesso.',
    type: Vacancy,
  })
  uploadDocument(
    @Param('code') code: string,
    @Body() dto: UploadVacancyDocumentDto,
    @Req() req: any,
  ) {
    return this.vacanciesService.addDocument(
      code,
      dto,
      { path: dto.key, originalName: dto.originalName },
      req.user.sub,
    )
  }

  @Post(':code/publish')
  @Permissions(PermissionsEnum.WRITE_VACANCIES)
  @ApiOperation({
    summary:
      'Publicar a vaga imediatamente ou agendar para a data de publicação definida',
  })
  @ApiParam({
    name: 'code',
    description: 'Código da vaga',
    example: 'VAG-2026-000001',
  })
  @ApiResponse({
    status: 201,
    description: 'Vaga publicada ou agendada com sucesso.',
    type: Vacancy,
  })
  publish(@Param('code') code: string, @Req() req: any) {
    return this.vacanciesService.publish(code, req.user.sub)
  }

  @Post(':code/suspend')
  @Permissions(PermissionsEnum.WRITE_VACANCIES)
  @ApiOperation({ summary: 'Suspender uma vaga publicada (com justificativa)' })
  @ApiParam({
    name: 'code',
    description: 'Código da vaga',
    example: 'VAG-2026-000001',
  })
  @ApiResponse({
    status: 201,
    description: 'Vaga suspensa com sucesso.',
    type: Vacancy,
  })
  suspend(
    @Param('code') code: string,
    @Body() dto: VacancyActionDto,
    @Req() req: any,
  ) {
    return this.vacanciesService.suspend(code, dto, req.user.sub)
  }

  @Post(':code/reactivate')
  @Permissions(PermissionsEnum.WRITE_VACANCIES)
  @ApiOperation({ summary: 'Reativar uma vaga suspensa' })
  @ApiParam({
    name: 'code',
    description: 'Código da vaga',
    example: 'VAG-2026-000001',
  })
  @ApiResponse({
    status: 201,
    description: 'Vaga reativada com sucesso.',
    type: Vacancy,
  })
  reactivate(@Param('code') code: string, @Req() req: any) {
    return this.vacanciesService.reactivate(code, req.user.sub)
  }

  @Post(':code/close')
  @Permissions(PermissionsEnum.WRITE_VACANCIES)
  @ApiOperation({ summary: 'Encerrar uma vaga (com justificativa)' })
  @ApiParam({
    name: 'code',
    description: 'Código da vaga',
    example: 'VAG-2026-000001',
  })
  @ApiResponse({
    status: 201,
    description: 'Vaga encerrada com sucesso.',
    type: Vacancy,
  })
  close(
    @Param('code') code: string,
    @Body() dto: VacancyActionDto,
    @Req() req: any,
  ) {
    return this.vacanciesService.close(code, dto, req.user.sub)
  }

  @Post(':code/cancel')
  @Permissions(PermissionsEnum.WRITE_VACANCIES)
  @ApiOperation({ summary: 'Cancelar uma vaga (com justificativa)' })
  @ApiParam({
    name: 'code',
    description: 'Código da vaga',
    example: 'VAG-2026-000001',
  })
  @ApiResponse({
    status: 201,
    description: 'Vaga cancelada com sucesso.',
    type: Vacancy,
  })
  cancel(
    @Param('code') code: string,
    @Body() dto: VacancyActionDto,
    @Req() req: any,
  ) {
    return this.vacanciesService.cancel(code, dto, req.user.sub)
  }
}
