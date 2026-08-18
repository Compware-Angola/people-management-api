import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EmployeeService } from './employee.service'
import { EmployeeController } from './employee.controller'
import { UserModule } from '../user/user.module'
import { Employee } from './entities/employee.entity'

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Employee])],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService, TypeOrmModule],
})
export class EmployeeModule {}
