import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Requisition } from './entity/requisition.entity'
import { RequisitionHistory } from './entity/requisition-history.entity'
import { Department } from 'src/modules/department/entity/department.entity'
import { CostCenter } from 'src/modules/cost-center/entity/cost-center.entity'
import { Position } from 'src/modules/Positions/entity/position.entity'
import { HiringType } from 'src/modules/hiring-types/entity/hiring-type.entity'
import { RequisitionState } from 'src/modules/requisition-states/entity/requisition-state.entity'
import { User } from 'src/modules/user/entities/user.entity'
import { RequisitionsController } from './controllers/requisitions.controller'
import { RequisitionsService } from './services/requisitions.service'
import { VacancyRequestType } from '../vacancy-request-type/entity/vacancy-request-type.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Requisition,
      RequisitionHistory,
      Department,
      CostCenter,
      Position,
      HiringType,
      RequisitionState,
      User,
      VacancyRequestType,
    ]),
  ],
  controllers: [RequisitionsController],
  providers: [RequisitionsService],
  exports: [RequisitionsService, TypeOrmModule],
})
export class RequisitionsModule {}
