import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmployeeModule } from './modules/employee/employee.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { BiometricModule } from './modules/biometric/biometric.module';
import { VacationModule } from './modules/vacation/vacation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        sid: configService.get<string>('DB_SID'),
        synchronize: false,
        logging: ['query', 'error'],
      }),
    }),
    EmployeeModule,
    AttendanceModule,
    BiometricModule,
    VacationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
