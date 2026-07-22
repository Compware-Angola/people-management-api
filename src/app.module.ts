import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnvModule } from './common/utils/env/env.module'
import { databaseConfig } from './common/utils/database-config'
import { EmployeeModule } from './modules/employee/employee.module'
import { AttendanceModule } from './modules/attendance/attendance.module'
import { BiometricModule } from './modules/biometric/biometric.module'
import { VacationModule } from './modules/vacation/vacation.module'
import { ApplicationsModule } from './modules/applications/applications.module'

@Module({
  imports: [
    EnvModule,
    TypeOrmModule.forRoot(databaseConfig),
    EmployeeModule,
    AttendanceModule,
    BiometricModule,
    VacationModule,
    ApplicationsModule,
  ],
})
export class AppModule {}
