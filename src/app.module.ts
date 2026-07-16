import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from './modules/employee/employee.module';
import { EnvModule } from './modules/utils/env/env.module';
import { databaseConfig } from './modules/utils/database-config';

@Module({
  imports: [
    EnvModule,
    TypeOrmModule.forRoot(databaseConfig),
    EmployeeModule,
  ],
})
export class AppModule { }
