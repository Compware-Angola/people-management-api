import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { InterviewScheduleEntity } from './entities/interview-schedule.entity'
import { InterviewScheduleInterviewerEntity } from './entities/interview-schedule-interviewer.entity'
import { InterviewModalityEntity } from './entities/interview-modality.entity'
import { InterviewScheduleStateEntity } from './entities/interview-schedule-state.entity'

import { InterviewScheduleService } from './services/interview-schedule.service'
import { InterviewModalityService } from './services/interview-modality.service'
import { InterviewScheduleStateService } from './services/interview-schedule-state.service'

import { InterviewScheduleController } from './controllers/interview-schedule.controller'
import { InterviewModalityController } from './controllers/interview-modality.controller'
import { InterviewScheduleStateController } from './controllers/interview-schedule-state.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterviewScheduleEntity,
      InterviewScheduleInterviewerEntity,
      InterviewModalityEntity,
      InterviewScheduleStateEntity,
    ]),
  ],
  controllers: [
    InterviewScheduleController,
    InterviewModalityController,
    InterviewScheduleStateController,
  ],
  providers: [
    InterviewScheduleService,
    InterviewModalityService,
    InterviewScheduleStateService,
  ],
  exports: [
    InterviewScheduleService,
    InterviewModalityService,
    InterviewScheduleStateService,
  ],
})
export class InterviewScheduleModule {}
