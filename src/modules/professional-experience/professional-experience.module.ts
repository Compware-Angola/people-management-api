import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ProfessionalExperienceController } from './controllers/professional-experience.controller'
import { ProfessionalExperienceService } from './services/professional-experience.service'
import { ProfessionalExperienceEntity } from './entity/professional-experience.entity'
import { PersonEntity } from '../applications/entity/person.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfessionalExperienceEntity, PersonEntity]),
  ],
  controllers: [ProfessionalExperienceController],
  providers: [ProfessionalExperienceService],
  exports: [ProfessionalExperienceService],
})
export class ProfessionalExperienceModule {}
