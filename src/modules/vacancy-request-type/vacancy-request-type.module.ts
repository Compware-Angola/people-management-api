import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VacancyRequestType } from './entity/vacancy-request-type.entity'
import { VacancyRequestTypeService } from './services/vacancy-request-type.service'
import { VacancyRequestTypeController } from './controllers/vacancy-request-type.controller'

@Module({
  imports: [TypeOrmModule.forFeature([VacancyRequestType])],
  controllers: [VacancyRequestTypeController],
  providers: [VacancyRequestTypeService],
  exports: [VacancyRequestTypeService],
})
export class VacancyRequestTypeModule {}
