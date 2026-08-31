import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AcademicDegree } from './entity/academic-degree.entity'
import { AcademicDegreeService } from './services/academic-degree.service'
import { AcademicDegreeController } from './controllers/academic-degree.controller'

@Module({
  imports: [TypeOrmModule.forFeature([AcademicDegree])],
  controllers: [AcademicDegreeController],
  providers: [AcademicDegreeService],
  exports: [AcademicDegreeService],
})
export class AcademicDegreeModule {}
