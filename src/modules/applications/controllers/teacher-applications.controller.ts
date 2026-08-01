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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'

import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { TeacherApplicationsService } from '../services/teacher-applications.service'
import { CreateApplicationDto } from '../dto/create-application.dto'
import { UpdateAcademicEducationsDto } from '../dto/update-academic-educations.dto'
import { UpdateTeachingExperiencesDto } from '../dto/update-teaching-experiences.dto'
import { UploadDocumentDto } from '../dto/upload-document.dto'
import { mapMulterFile } from 'src/commons/utils/multer-file.mapper'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: TeacherApplicationsService) {}

  @Post('teachers')
  @ApiOperation({ summary: 'Criar candidatura docente' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'identificationDocument', maxCount: 1 },
      { name: 'cv', maxCount: 1 },
      { name: 'courseCertificate', maxCount: 1 },
      { name: 'pedagogicalAggregation', maxCount: 1 },
      { name: 'certificates', maxCount: 20 },
    ]),
  )
  create(
    @Body() dto: CreateApplicationDto,
    @UploadedFiles()
    files: {
      identificationDocument: Express.Multer.File[]
      cv: Express.Multer.File[]
      courseCertificate: Express.Multer.File[]
      pedagogicalAggregation: Express.Multer.File[]
      certificates: Express.Multer.File[]
    },
  ) {
    return this.service.create({
      ...dto,
      files: {
        identificationDocument: mapMulterFile(files.identificationDocument[0]),
        cv: mapMulterFile(files.cv[0]),
        courseCertificate: mapMulterFile(files.courseCertificate[0]),
        pedagogicalAggregation: mapMulterFile(files.pedagogicalAggregation[0]),
        certificates: files.certificates.map(mapMulterFile),
      },
    })
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
}