import { Module } from '@nestjs/common'
import { ApplicationsController } from './controllers/teacher-applications.controller'
import { StorageService } from 'src/common/services/storage.service'
import { TeacherApplicationsService } from './services/teacher-applications.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PersonEntity } from '../person/entity/person.entity'
import { CandidateEntity } from './entity/candidate.entity'
import { AcademicEducationEntity } from './entity/academic-education.entity'
import { TeachingExperienceEntity } from './entity/teaching-experience.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonEntity,
      CandidateEntity,
      AcademicEducationEntity,
      AcademicEducationEntity,
      TeachingExperienceEntity,
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [StorageService, TeacherApplicationsService],
})
export class ApplicationsModule {}
