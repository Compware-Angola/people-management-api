import { Module } from '@nestjs/common'
import { AcademicService } from './academic.service'

@Module({
  providers: [AcademicService],
  exports: [AcademicService],
})
export class AcademicModule {}
