import { PartialType } from '@nestjs/swagger'

import { CreateInterviewScheduleDto } from './create-interview-schedule.dto'

export class UpdateInterviewScheduleDto extends PartialType(
  CreateInterviewScheduleDto,
) {}
