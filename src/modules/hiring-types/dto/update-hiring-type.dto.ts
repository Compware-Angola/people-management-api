import { PartialType } from '@nestjs/swagger'
import { CreateHiringTypeDto } from './create-hiring-type.dto'

export class UpdateHiringTypeDto extends PartialType(CreateHiringTypeDto) {}
