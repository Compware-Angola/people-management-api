import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvModule } from './commons/utils/env/env.module';
import { databaseConfig } from './commons/utils/database-config';
import { EmployeeModule } from './modules/employee/employee.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { BiometricModule } from './modules/biometric/biometric.module';
import { VacationModule } from './modules/vacation/vacation.module';
import { UserModule } from './modules/user/user.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { LeavesModule } from './modules/leaves/leaves.module';
import { PositionsModule } from './modules/possition/possition.module';

@Module({
  imports: [
    EnvModule,
    TypeOrmModule.forRoot(databaseConfig),
    EmployeeModule,
    AttendanceModule,
    BiometricModule,
    VacationModule,
    UserModule,
    PermissionsModule,
    ApplicationsModule,
    LeavesModule,
    PositionsModule
  ],
})
export class AppModule {}
