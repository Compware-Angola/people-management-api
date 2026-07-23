import { Module } from '@nestjs/common'
import { ApplicationsController } from './controllers/teacher-applications.controller'
import { StorageService } from 'src/commons/services/storage.service'
import { TeacherApplicationsService } from './services/teacher-applications.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PersonEntity } from './entity/person.entity'
import { CandidateEntity } from './entity/candidate.entity'
import { AcademicEducationEntity } from './entity/academic-education.entity'
import { TeachingExperienceEntity } from './entity/teaching-experience.entity'
import { TeacherApplicationDocument } from './entity/teacher-application-document.entity'
import { HashService } from 'src/commons/services/hash.service'
import { User } from '../user/entities/user.entity'
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonEntity,
      CandidateEntity,
      AcademicEducationEntity,
      AcademicEducationEntity,
      TeachingExperienceEntity,
      TeacherApplicationDocument,
      User
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [StorageService, HashService, TeacherApplicationsService],
})
export class ApplicationsModule {}
