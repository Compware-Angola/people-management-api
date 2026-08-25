import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Criteria } from './entity/criteria.entity'
import { CriteriaService } from './services/criteria.service'
import { CriteriaController } from './controllers/criteria.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Criteria])],
  controllers: [CriteriaController],
  providers: [CriteriaService],
  exports: [CriteriaService],
})
export class CriteriaModule {}
