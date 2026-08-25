import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CriteriaVacancy } from './entity/criteria-vacancy.entity'
import { CriteriaVacancyService } from './services/criteria-vacancy.service'
import { CriteriaVacancyController } from './controllers/criteria-vacancy.controller'

import { Criteria } from '../criteria/entity/criteria.entity'
import { Vacancy } from '../vacancies/entity/vacancy.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CriteriaVacancy, Criteria, Vacancy])],
  controllers: [CriteriaVacancyController],
  providers: [CriteriaVacancyService],
  exports: [CriteriaVacancyService],
})
export class CriteriaVacancyModule {}
