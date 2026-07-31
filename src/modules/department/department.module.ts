import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Department } from "./entity/department.entity";
import { DepartmentsController } from "./controllers/depatmnet.controller";
import { DepartmentsService } from "./services/department.service";

@Module({
    imports: [TypeOrmModule.forFeature([Department])],
    controllers: [DepartmentsController],
    providers: [DepartmentsService],
    exports: [DepartmentsService],
})
export class DepartmentModule {}