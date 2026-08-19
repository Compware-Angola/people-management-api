import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { TeacherApplicationsService } from '../services/teacher-applications.service'
import { CreateApplicationDto } from '../dto/create-application.dto'
import { UpdateAcademicEducationsDto } from '../dto/update-academic-educations.dto'
import { UpdateTeachingExperiencesDto } from '../dto/update-teaching-experiences.dto'
import { UploadDocumentDto } from '../dto/upload-document.dto'
import { mapMulterFile } from 'src/commons/utils/multer-file.mapper'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { RegisterDocumentDto } from '../dto/register-document.dto'
import { PersonalDto } from '../dto/personal.dto'

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: TeacherApplicationsService) {}

  @Post('teachers')
  @ApiOperation({ summary: 'Criar candidatura docente' })
  create(@Body() dto: CreateApplicationDto) {
    return this.service.create(dto)
  }

  @Post('teachers/check-personal')
  @ApiOperation({
    summary:
      'Verificar se e-mail, número de documento ou telefone já estão associados a um candidato, antes de submeter a candidatura',
  })
  checkPersonal(@Body() dto: PersonalDto) {
    return this.service.checkPersonalUniqueness(dto)
  }

  @ApiBearerAuth()
  @UseGuards(RemoteJwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Obter a candidatura do utilizador autenticado' })
  myApplications(@Req() req: any) {
    return this.service.myApplications(req.user.username)
  }

  @ApiBearerAuth()
  @UseGuards(RemoteJwtAuthGuard)
  @Put(':candidateId/academic-educations')
  @ApiOperation({ summary: 'Atualizar formação académica da candidatura' })
  updateAcademicEducations(
    @Req() req: any,
    @Param('candidateId', ParseIntPipe) candidateId: number,
    @Body() dto: UpdateAcademicEducationsDto,
  ) {
    return this.service.updateAcademicEducations(
      req.user.username,
      candidateId,
      dto.items,
    )
  }

  @ApiBearerAuth()
  @UseGuards(RemoteJwtAuthGuard)
  @Put(':candidateId/teaching-experiences')
  @ApiOperation({ summary: 'Atualizar experiência docente da candidatura' })
  updateTeachingExperiences(
    @Req() req: any,
    @Param('candidateId', ParseIntPipe) candidateId: number,
    @Body() dto: UpdateTeachingExperiencesDto,
  ) {
    return this.service.updateTeachingExperiences(
      req.user.username,
      candidateId,
      dto.items,
    )
  }

  @ApiBearerAuth()
  @UseGuards(RemoteJwtAuthGuard)
  @Post(':candidateId/documents')
  @ApiOperation({ summary: 'Enviar/substituir um documento da candidatura' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Req() req: any,
    @Param('candidateId', ParseIntPipe) candidateId: number,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadDocument(
      req.user.username,
      candidateId,
      dto.documentTypeId,
      mapMulterFile(file),
    )
  }

  @ApiBearerAuth()
  @UseGuards(RemoteJwtAuthGuard)
  @Post(':candidateId/documents/register')
  @ApiOperation({
    summary:
      'Registar documento da candidatura a partir de um ficheiro já enviado ao storage',
  })
  registerDocument(
    @Req() req: any,
    @Param('candidateId', ParseIntPipe) candidateId: number,
    @Body() dto: RegisterDocumentDto,
  ) {
    return this.service.registerDocument(
      req.user.username,
      candidateId,
      dto.documentTypeId,
      dto.key,
    )
  }

  @ApiBearerAuth()
  @UseGuards(RemoteJwtAuthGuard)
  @Post(':candidateId/renew')
  @ApiOperation({ summary: 'Renovar candidatura docente' })
  renewApplication(
    @Req() req: any,
    @Param('candidateId', ParseIntPipe) candidateId: number,
  ) {
    return this.service.renewApplication(req.user.username, candidateId)
  }
}
