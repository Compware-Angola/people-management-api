import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VacancyState } from './entity/vacancy-state.entity'
import { VacancyStatesService } from './services/vacancy-states.service'
import { VacancyStatesController } from './controllers/vacancy-states.controller'

@Module({
  imports: [TypeOrmModule.forFeature([VacancyState])],
  controllers: [VacancyStatesController],
  providers: [VacancyStatesService],
  exports: [VacancyStatesService],
})
export class VacancyStatesModule {}
