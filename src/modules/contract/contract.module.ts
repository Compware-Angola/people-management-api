import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContractController } from './contract.controller'
import { ContractService } from './contract.service'
import { Contract } from './entities/contract.entity'
import { ContractEmployee } from './entities/contract-employee.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Contract, ContractEmployee])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
