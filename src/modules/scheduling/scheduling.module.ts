import { Module } from '@nestjs/common'
import { SchedulingController } from './controllers/scheduling.controller'
import { SchedulingService } from './services/scheduling.service'

@Module({
  imports: [],
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
