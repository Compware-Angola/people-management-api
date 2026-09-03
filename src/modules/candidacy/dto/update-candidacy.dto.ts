import { PartialType } from '@nestjs/swagger';
import { CreateCandidacyDto } from './create-candidacy.dto';

export class UpdateCandidacyDto extends PartialType(CreateCandidacyDto) {}
