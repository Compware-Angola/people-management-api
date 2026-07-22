import { Module } from '@nestjs/common'
import { ApplicationsController } from './controllers/teacher-applications.controller'
import { StorageService } from 'src/common/services/storage.service'
import { TeacherApplicationsService } from './services/teacher-applications.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PersonEntity } from '../person/entity/person.entity'
import { CandidateEntity } from './entity/candidate.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PersonEntity, CandidateEntity])],
  controllers: [ApplicationsController],
  providers: [StorageService, TeacherApplicationsService],
})
export class ApplicationsModule {}
