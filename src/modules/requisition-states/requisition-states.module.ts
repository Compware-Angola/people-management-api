import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RequisitionState } from './entity/requisition-state.entity'
import { RequisitionStatesService } from './services/requisition-states.service'
import { RequisitionStatesController } from './controllers/requisition-states.controller'

@Module({
  imports: [TypeOrmModule.forFeature([RequisitionState])],
  controllers: [RequisitionStatesController],
  providers: [RequisitionStatesService],
  exports: [RequisitionStatesService],
})
export class RequisitionStatesModule {}
