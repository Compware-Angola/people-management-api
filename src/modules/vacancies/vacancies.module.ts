import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Vacancy } from './entity/vacancy.entity'
import { VacancyDocument } from './entity/vacancy-document.entity'
import { VacancyHistory } from './entity/vacancy-history.entity'
import { Requisition } from 'src/modules/requisitions/entity/requisition.entity'
import { VacancyState } from 'src/modules/vacancy-states/entity/vacancy-state.entity'
import { User } from 'src/modules/user/entities/user.entity'
import { VacanciesController } from './controllers/vacancies.controller'
import { VacanciesService } from './services/vacancies.service'
import { StorageService } from 'src/commons/services/storage.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vacancy,
      VacancyDocument,
      VacancyHistory,
      Requisition,
      VacancyState,
      User,
    ]),
  ],
  controllers: [VacanciesController],
  providers: [VacanciesService, StorageService],
  exports: [VacanciesService],
})
export class VacanciesModule {}
