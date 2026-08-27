import { PartialType } from '@nestjs/swagger'

import { CreateVacancyRequestTypeDto } from './create-vacancy-request-type.dto'

export class UpdateVacancyRequestTypeDto extends PartialType(
  CreateVacancyRequestTypeDto,
) {}
