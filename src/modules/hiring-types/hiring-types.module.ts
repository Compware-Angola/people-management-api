import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HiringType } from './entity/hiring-type.entity'
import { HiringTypesService } from './services/hiring-types.service'
import { HiringTypesController } from './controllers/hiring-types.controller'

@Module({
  imports: [TypeOrmModule.forFeature([HiringType])],
  controllers: [HiringTypesController],
  providers: [HiringTypesService],
  exports: [HiringTypesService],
})
export class HiringTypesModule {}
