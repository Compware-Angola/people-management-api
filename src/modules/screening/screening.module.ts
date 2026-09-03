import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Vacancy } from '../vacancies/entity/vacancy.entity'

import { ScreeningController } from './controllers/screening.controller'
import { ScreeningService } from './services/screening.service'

import { ScoringRegistry } from './scoring/scoring.registry'
import { GrauAcademicoStrategy } from './scoring/grau-academico.strategy'
import { FormacaoAcademicaStrategy } from './scoring/formacao-academica.strategy'
import { ExpDocenteStrategy } from './scoring/exp-docente.strategy'
import { ExpProfissionalStrategy } from './scoring/exp-profissional.strategy'

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy])],
  controllers: [ScreeningController],
  providers: [
    ScreeningService,
    ScoringRegistry,
    GrauAcademicoStrategy,
    FormacaoAcademicaStrategy,
    ExpDocenteStrategy,
    ExpProfissionalStrategy,
  ],
  exports: [ScreeningService],
})
export class ScreeningModule {}
