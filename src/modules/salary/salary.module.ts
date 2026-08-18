import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SalaryController } from './salary.controller'
import { SalaryService } from './salary.service'
import { Salary } from './entities/salary.entity'
import { SalaryEmployee } from './entities/salary-employee.entity'
import { Rubric } from './entities/rubric.entity'
import { SalaryRubric } from './entities/salary-rubric.entity'
import { SalaryProcessing } from './entities/salary-processing.entity'
import { SalaryProcessingEmployee } from './entities/salary-processing-employee.entity'
import { SalaryProcessingController } from './salary-processing.controller'
import { SalaryProcessingService } from './salary-processing.service'
import { Attendance } from '../attendance/entities/attendance.entity'
import { ContractModule } from '../contract/contract.module'
import { AcademicModule } from '../academic/academic.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Salary,
      SalaryEmployee,
      Rubric,
      SalaryRubric,
      SalaryProcessing,
      SalaryProcessingEmployee,
      Attendance,
    ]),
    ContractModule,
    AcademicModule,
  ],
  controllers: [SalaryController, SalaryProcessingController],
  providers: [SalaryService, SalaryProcessingService],
  exports: [SalaryService, SalaryProcessingService],
})
export class SalaryModule {}
