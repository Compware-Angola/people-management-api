import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CandidacyController } from './candidacy.controller'
import { CandidacyService } from './candidacy.service'
import { Candidacy } from './entities/candidacy.entity'
import { CandidacyHistory } from './entities/candidacy-history.entity'
import { Vacancy } from 'src/modules/vacancies/entity/vacancy.entity'
import { PersonEntity } from 'src/modules/applications/entity/person.entity'
import { CandidateEntity } from 'src/modules/applications/entity/candidate.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Candidacy,
      CandidacyHistory,
      Vacancy,
      PersonEntity,
      CandidateEntity,
    ]),
  ],
  controllers: [CandidacyController],
  providers: [CandidacyService],
  exports: [CandidacyService],
})
export class CandidacyModule {}
