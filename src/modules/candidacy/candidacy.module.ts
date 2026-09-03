import { Module } from '@nestjs/common';
import { CandidacyService } from './candidacy.service';
import { CandidacyController } from './candidacy.controller';

@Module({
  controllers: [CandidacyController],
  providers: [CandidacyService],
})
export class CandidacyModule {}
