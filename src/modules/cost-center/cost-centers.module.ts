import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostCenter } from './entity/cost-center.entity';
import { CostCentersController } from './controllers/cost-centers.controller';
import { CostCentersService } from './services/cost-centers.service';
import { Department } from '../department/entity/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CostCenter, Department])],
  controllers: [CostCentersController],
  providers: [CostCentersService],
  exports: [CostCentersService],
})
export class CostCentersModule {}