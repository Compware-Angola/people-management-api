import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'

import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { TeacherApplicationsService } from '../services/teacher-applications.service'
import { CreateApplicationDto } from '../dto/create-application.dto'
import { mapMulterFile } from 'src/common/utils/multer-file.mapper'

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: TeacherApplicationsService) {}

  @Post('teachers')
  @ApiOperation({
    summary: 'Criar candidatura docente',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'identificationDocument',
        maxCount: 1,
      },

      {
        name: 'cv',
        maxCount: 1,
      },

      {
        name: 'courseCertificate',
        maxCount: 1,
      },

      {
        name: 'pedagogicalAggregation',
        maxCount: 1,
      },

      {
        name: 'certificates',
        maxCount: 20,
      },
    ]),
  )
  create(
    @Body()
    dto: CreateApplicationDto,

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
}
