import { PartialType } from '@nestjs/swagger'
import { CreateCriteriaVacancyDto } from './create-criteria-vacancy.dto'

export class UpdateCriteriaVacancyDto extends PartialType(
  CreateCriteriaVacancyDto,
) {}
