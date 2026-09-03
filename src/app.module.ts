import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnvModule } from './commons/utils/env/env.module'
import { databaseConfig } from './commons/utils/database-config'
import { EmployeeModule } from './modules/employee/employee.module'
import { AttendanceModule } from './modules/attendance/attendance.module'
import { BiometricModule } from './modules/biometric/biometric.module'
import { VacationModule } from './modules/vacation/vacation.module'
import { UserModule } from './modules/user/user.module'
import { PermissionsModule } from './modules/permissions/permissions.module'
import { ApplicationsModule } from './modules/applications/applications.module'
import { LeavesModule } from './modules/leaves/leaves.module'
import { PositionsModule } from './modules/Positions/possition.module'
import { DepartmentModule } from './modules/department/department.module'
import { CostCentersModule } from './modules/cost-center/cost-centers.module'
import { HiringTypesModule } from './modules/hiring-types/hiring-types.module'
import { RequisitionStatesModule } from './modules/requisition-states/requisition-states.module'
import { RequisitionsModule } from './modules/requisitions/requisitions.module'
import { VacancyStatesModule } from './modules/vacancy-states/vacancy-states.module'
import { VacanciesModule } from './modules/vacancies/vacancies.module'
import { SalaryModule } from './modules/salary/salary.module'
import { ContractModule } from './modules/contract/contract.module'
import { CriteriaModule } from './modules/criteria/criteria.module'
import { CriteriaVacancyModule } from './modules/criteria-vacancy/criteria-vacancy.module'
import { VacancyRequestTypeModule } from './modules/vacancy-request-type/vacancy-request-type.module'
import { ScreeningModule } from './modules/screening/screening.module'
import { ProfessionalExperienceModule } from './modules/professional-experience/professional-experience.module'

import { CandidacyModule } from './modules/candidacy/candidacy.module'

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
    PositionsModule,
    DepartmentModule,
    CostCentersModule,
    HiringTypesModule,
    RequisitionStatesModule,
    RequisitionsModule,
    VacancyStatesModule,
    VacanciesModule,
    ApplicationsModule,
    LeavesModule,
    SalaryModule,
    ContractModule,
    CriteriaModule,
    CriteriaVacancyModule,
    VacancyRequestTypeModule,
    ScreeningModule,
    ProfessionalExperienceModule,

    CandidacyModule,
  ],
})
export class AppModule {}
