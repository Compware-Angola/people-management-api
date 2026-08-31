import { PartialType } from '@nestjs/swagger'

import { CreateAcademicDegreeDto } from './create-academic-degree.dto'

export class UpdateAcademicDegreeDto extends PartialType(
  CreateAcademicDegreeDto,
) {}
