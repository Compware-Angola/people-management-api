import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SalaryController } from './salary.controller'
import { SalaryService } from './salary.service'
import { Salary } from './entities/salary.entity'
import { SalaryEmployee } from './entities/salary-employee.entity'
import { Rubric } from './entities/rubric.entity'
import { SalaryRubric } from './entities/salary-rubric.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Salary, SalaryEmployee, Rubric, SalaryRubric]),
  ],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
