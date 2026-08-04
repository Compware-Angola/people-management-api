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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
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
import { StorageService } from 'src/commons/services/storage.service'
import { mapMulterFile } from 'src/commons/utils/multer-file.mapper'

@ApiTags('Vacancies')
@ApiBearerAuth()
@Controller('vacancies')
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class VacanciesController {
  constructor(
    private readonly vacanciesService: VacanciesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @Permissions('write:vacancies')
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
  @Permissions('read:vacancies')
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
  @Permissions('read:vacancies')
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
  @Permissions('write:vacancies')
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
  @Permissions('write:vacancies')
  @ApiOperation({
    summary: 'Anexar documento à vaga (ex.: Edital de Contratação)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'code',
    description: 'Código da vaga',
    example: 'VAG-2026-000001',
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 201,
    description: 'Documento anexado com sucesso.',
    type: Vacancy,
  })
  async uploadDocument(
    @Param('code') code: string,
    @Body() dto: UploadVacancyDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const uploadResult = await this.storageService.upload(mapMulterFile(file))
    return this.vacanciesService.addDocument(
      code,
      dto,
      {
        path: uploadResult.file.path,
        originalName: uploadResult.file.originalname,
      },
      req.user.sub,
    )
  }

  @Post(':code/publish')
  @Permissions('write:vacancies')
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
  @Permissions('write:vacancies')
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
  @Permissions('write:vacancies')
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
  @Permissions('write:vacancies')
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
  @Permissions('write:vacancies')
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
